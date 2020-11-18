import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { PDFRenderParams } from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib'
import { Rnd } from 'react-rnd';
import { makeStyles } from '@material-ui/core';
import SignatureToolbar from './toolbar/toolbar';

interface InputLocation {
    id: string;
    location: { x: number, y: number };
    size: { width: number, height: number }
}

interface DocumentOptions {
    pageGap?: number;
    scale?: number;
}

interface IProps {
    file: ArrayBuffer | Uint8Array;
    options?: DocumentOptions;
}

const styles = makeStyles({
    documentBox: {
        height: "100%",
        overflowY: "auto"
    },
    documetCanvasBox: {
        textAlign: "center",
        margin: "0 auto",
        position: "relative",
    },
    documentCanvas: {
        display: "block",
    },
    draggableInputBox: {
        border: "0.1px solid red"
    }
})

export default function Signature(props: IProps) {

    const classes = styles();

    //PDF File
    const [pdfBytes, setPDFBytes] = useState<ArrayBuffer | Uint8Array>(props.file)
    const [documentLoading, setDocumentLoading] = useState(false);

    //TEST Signature
    const [testSig, setTestSig] = useState<string>('')

    //Document Options
    const [pageGap, setPageGap] = useState(typeof props.options?.pageGap === 'undefined' ? 15 : props.options.pageGap);
    const [documentScale, setDocumentScale] = useState(typeof props.options?.scale === 'undefined' ? 1.2 : props.options.scale);

    //Document Variables
    const [currentScrolledPage, setCurrentScrolledPage] = useState(1);
    const [numOfPages, setNumOfPages] = useState(0)
    const [pageHeight, setPageHeight] = useState(0)
    const [inputLocations, setInputLocations] = useState<InputLocation[]>([])

    useEffect(() => {

        pdfjs.GlobalWorkerOptions.workerSrc = `/js/pdf.worker.js`;

        renderPDFDocument(pdfBytes).then(async () => {
            await fetchTestSig()
        })

    }, [])

    async function fetchTestSig() {
        const sigFetch = await fetch(`http://localhost:3000/img/testsig.png`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            credentials: 'include',
        })

        var reader = new FileReader();
        reader.onload = function () { if (typeof this.result === 'string') { setTestSig(this.result) } };
        reader.readAsDataURL(await sigFetch.blob());

    }

    //Re-render a single PDF page.
    async function renderPDFPage(data: ArrayBuffer, pageNumber: number) {
        let pdf = await pdfjs.getDocument(data).promise;

        if (pdf.numPages <= 0) {
            throw new Error("No pages found")
        }

        const canvasElement = document.getElementById(`signature-document-canvas-box-${pageNumber}`) as HTMLCanvasElement;

        if (canvasElement) {
            const context = canvasElement.getContext('2d');

            if (context) {

                const page = await pdf.getPage(pageNumber);

                if (page) {
                    const viewport = page.getViewport({ scale: documentScale });

                    //adjust parent div to viewport width and height.
                    let ele = document.getElementById('signature-document-canvas-box') as HTMLElement;
                    ele.style.width = viewport.width + "px";
                    ele.style.height = ((viewport.height * pdf.numPages) + (pageGap * pdf.numPages)) + "px";

                    const renderContext: PDFRenderParams = {
                        canvasContext: context,
                        viewport: viewport,
                    };

                    await page.render(renderContext).promise;

                    setPageHeight(Math.floor(viewport.height))
                    setPDFBytes(data)
                }
            }
        }
    }

    //Render the entire PDF document
    async function renderPDFDocument(data: ArrayBuffer, scale?: number): Promise<void> {
        try {
            setDocumentLoading(true);

            let pdf = await pdfjs.getDocument(data).promise;

            if (pdf.numPages <= 0) {
                throw new Error("No pages found")
            }

            if (typeof scale === 'undefined') {
                scale = documentScale;
            }

            //Fetch first page and adjust parent div to viewport width and height.
            let page = await pdf.getPage(1);
            var viewport = page.getViewport({ scale: scale });
            let ele = document.getElementById('signature-document-canvas-box') as HTMLElement;
            ele.style.width = viewport.width + "px";
            ele.style.height = ((viewport.height * pdf.numPages) + (pageGap * pdf.numPages)) + "px";

            //If no renderPage is passed then remove all canvases and re-render.
            (document.getElementById('signature-document-canvas-box') as HTMLElement).innerHTML = '';

            //Draw all of the new canvases for the document.
            for (var i = 1; i <= pdf.numPages; i++) {

                const canvasElement = document.createElement("CANVAS") as HTMLCanvasElement;

                canvasElement.id = `signature-document-canvas-box-${i}`
                canvasElement.className = `${classes.documentCanvas} z-depth-3`;
                canvasElement.style.marginBottom = `${pageGap}px`

                const context = canvasElement.getContext('2d');

                if (context) {
                    const page = await pdf.getPage(i);

                    const viewport = page.getViewport({ scale: scale });

                    canvasElement.height = viewport.height;
                    canvasElement.width = viewport.width;

                    let ele = document.getElementById('signature-document-canvas-box') as HTMLElement;
                    ele.appendChild(canvasElement)

                    const renderContext: PDFRenderParams = {
                        canvasContext: context,
                        viewport: viewport,
                    };

                    await page.render(renderContext).promise;
                }
            }


            setPageHeight(Math.floor(viewport.height))
            setNumOfPages(pdf.numPages)
            setDocumentScale(scale)
            setDocumentLoading(false)
            setPDFBytes(data)
            
        } catch (err) {
            console.log(err)
            setDocumentLoading(false)
        }
    }

    async function signPDF(input: InputLocation): Promise<void> {

        if (pdfBytes) {
            const documentHeight = pageHeight + pageGap;

            //Get the current page the input box is on.
            let pageNumber = Math.ceil(((input.location.y + pageGap) / documentHeight));

            if (pageNumber <= 0) {
                pageNumber = 1;
            }

            //Y cordinate on the current page the input box is on.
            const currentPageY = (documentHeight - ((documentHeight * pageNumber) - input.location.y))

            //Get the bottom left corner of the input box.
            const finalY = (currentPageY / documentScale) + (input.size.height / documentScale);

            //Flip the Y cordinate to the opposite. Since PDF-lib Y cordinate starts at the bottom left of the page.
            const oppositeY = Math.abs((documentHeight / documentScale) - finalY);

            const pdfDoc = await PDFDocument.load(pdfBytes)

            const page = pdfDoc.getPages()[pageNumber - 1];

            const pngImage = await pdfDoc.embedPng(testSig);

            page.drawImage(pngImage, {
                x: (input.location.x / documentScale),
                y: oppositeY - (pageGap / documentScale),
                width: (input.size.width / documentScale),
                height: (input.size.height / documentScale)
            })

            const newPDFBytes = await pdfDoc.save()

            await renderPDFPage(newPDFBytes, pageNumber)

        }
    }

    function addInput(): void {

        const scrollBox = document.getElementById('signature-document-box')

        if (scrollBox) {
            inputLocations.push({
                id: Math.random().toString(),
                location: { x: 250, y: scrollBox.scrollTop + pageHeight / 3 },
                size: { width: 100 * documentScale, height: 100 * documentScale }
            })

            setInputLocations([...inputLocations])
        }
    }

    async function increaseScale(): Promise<void> {
        if (!documentLoading) {
            await renderPDFDocument(pdfBytes, documentScale + 0.1)
        }
    }

    async function decreaseScale(): Promise<void> {
        if (!documentLoading) {
            await renderPDFDocument(pdfBytes, documentScale - 0.1)
        }
    }

    //Finds out what page we are currently scrolled on.
    function checkPageScroll() {
        const currentScrollHeight = document.getElementById('signature-document-box')?.scrollTop
        if (typeof currentScrollHeight !== 'undefined') {
            const currentPage = Math.floor(((currentScrollHeight + (pageHeight / 2)) / (pageHeight + pageGap)) + 1)
            if (currentPage <= numOfPages && currentPage >= 1) {
                setCurrentScrolledPage(currentPage)
            }
        }

    }

    return (
        <div id="signature-document-box" className={classes.documentBox} onScroll={checkPageScroll}>
            <SignatureToolbar decreaseScale={decreaseScale} increaseScale={increaseScale} addInput={addInput} />
            <div id="signature-document-canvas-box" className={classes.documetCanvasBox}>
                {inputLocations.map((input: InputLocation) => {
                    return (
                        <Rnd
                            className={classes.draggableInputBox}
                            key={input.id}
                            onDoubleClick={() => { signPDF(input); }}
                            onDragStop={(e: any, d: any) => { input.location = { x: d.x, y: d.y } }}
                            onResizeStop={(e: any, dir: any, ref: any) => { input.size = { height: ref.offsetHeight, width: ref.offsetWidth }; setInputLocations([...inputLocations]) }}
                            default={{
                                x: input.location.x,
                                y: input.location.y,
                                width: input.size.width,
                                height: input.size.height,
                            }}
                            size={{ width: input.size.width, height: input.size.height }}
                        >
                            <img width={input.size.width} height={input.size.height} draggable={false} src={testSig} />
                        </Rnd>
                    )
                })}
            </div>
            <br />
        </div>
    )
}