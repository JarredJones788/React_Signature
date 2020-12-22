import React, { useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFRenderParams } from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib'
import { Rnd } from 'react-rnd';
import { makeStyles } from '@material-ui/core';
import { debounce } from 'throttle-debounce';
import SignatureToolbar from '../toolbar/toolbar';
import { DocumentOptions, InputLocation } from '../document';

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
        WebkitBoxShadow: "0 8px 17px 2px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)",
        boxShadow: "0 8px 17px 2px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)"
    },
    draggableInputBox: {
        border: "0.1px solid red"
    }
})

export default function MultiPageViewer(props: IProps) {

    const classes = styles();

    const [documentScale, setDocumentScale] = useState(typeof props.options?.scale === 'undefined' ? 1.2 : props.options.scale,)

    const [documentState, setDocumentState] = useState({
        pdfBytes: props.file,
        loading: false,
        numOfPages: 0,
        currentScrolledPage: typeof props.options?.startPage === 'undefined' ? 1 : props.options.startPage,
        pageHeight: 0,
        pageGap: typeof props.options?.pageGap === 'undefined' ? 15 : props.options.pageGap
    })

    const [inputLocations, setInputLocations] = useState<InputLocation[]>(typeof props.options?.inputLocations === 'undefined' ? [] : props.options.inputLocations)

    useEffect(() => {

        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

        renderPDFDocument(documentState.pdfBytes).then(() => {
            if (documentState.currentScrolledPage > 1) {
                (document.getElementById(`signature-document-canvas-box-${documentState.currentScrolledPage}`) as HTMLElement).scrollIntoView();
            }

            if (typeof props.options?.onDocumentLoaded !== 'undefined') {
                props.options.onDocumentLoaded()
            }
        })

    }, [])


    //Render the entire PDF document
    async function renderPDFDocument(data: ArrayBuffer, scale?: number): Promise<void> {
        try {
            if (!documentState.loading) {

                setDocumentState({ ...documentState, loading: true })

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
                ele.style.height = ((viewport.height * pdf.numPages) + (documentState.pageGap * pdf.numPages)) + "px";

                //remove all canvases and re-render.
                (document.getElementById('signature-document-canvas-box') as HTMLElement).innerHTML = '';

                setDocumentScale(scale)

                //Draw all of the new canvases for the document.
                for (var i = 1; i <= pdf.numPages; i++) {

                    const canvasElement = document.createElement("CANVAS") as HTMLCanvasElement;

                    canvasElement.id = `signature-document-canvas-box-${i}`
                    canvasElement.className = `${classes.documentCanvas}`;
                    canvasElement.style.marginBottom = `${documentState.pageGap}px`

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

                setDocumentState({
                    ...documentState,
                    pageHeight: Math.floor(viewport.height),
                    pdfBytes: data,
                    loading: false,
                    numOfPages: pdf.numPages
                })
            }

        } catch (err) {
            console.log(err)
            setDocumentState({
                ...documentState,
                loading: false
            })

        }
    }

    function addInput(data: any): void {

        const scrollBox = document.getElementById('signature-document-box')

        if (scrollBox) {
            const img = new Image();

            img.src = data.trimmed;

            const documentHeight = documentState.pageHeight + documentState.pageGap;

            let pageNumber = Math.ceil((((scrollBox.scrollTop + documentState.pageHeight / 3) + documentState.pageGap) / documentHeight));

            img.onload = function () {
                inputLocations.push({
                    id: Math.random().toString(),
                    location: { x: 250, y: scrollBox.scrollTop + documentState.pageHeight / 3 },
                    size: { width: (img.naturalWidth / 3), height: (img.naturalHeight / 3) },
                    trimmedImg: data.trimmed,
                    originalImg: data.original,
                    page: pageNumber
                })

                setInputLocations([...inputLocations])

            };

        }
    }

    async function increaseScale(): Promise<void> {
        await renderPDFDocument(documentState.pdfBytes, documentScale + 0.1)
    }

    async function decreaseScale(): Promise<void> {
        await renderPDFDocument(documentState.pdfBytes, documentScale - 0.1)
    }

    async function nextPage(): Promise<void> {

        if (documentState.currentScrolledPage + 1 > documentState.numOfPages) {
            return;
        }

        (document.getElementById(`signature-document-canvas-box-${documentState.currentScrolledPage + 1}`) as HTMLElement).scrollIntoView();
    }
    async function prevPage(): Promise<void> {

        if (documentState.currentScrolledPage - 1 < 1) {
            return;
        }

        (document.getElementById(`signature-document-canvas-box-${documentState.currentScrolledPage - 1}`) as HTMLElement).scrollIntoView();
    }

    async function saveDocument(): Promise<void> {

        if (documentState.pdfBytes) {
            const inputs = inputLocations;

            const documentHeight = documentState.pageHeight + documentState.pageGap;

            const pdfDoc = await PDFDocument.load(documentState.pdfBytes)

            for (var i in inputs) {
                const input = inputs[i];
                if (!input) { continue }

                //Get the current page the input box is on.
                let pageNumber = Math.ceil(((input.location.y + documentState.pageGap) / documentHeight));

                if (pageNumber <= 0) {
                    pageNumber = 1;
                }

                //Y cordinate on the current page the input box is on.
                const currentPageY = (documentHeight - ((documentHeight * pageNumber) - input.location.y))

                //Get the bottom left corner of the input box.
                const finalY = (currentPageY / documentScale) + (input.size.height / documentScale);

                //Flip the Y cordinate to the opposite. Since PDF-lib Y cordinate starts at the bottom left of the page.
                const oppositeY = Math.abs((documentHeight / documentScale) - finalY);

                const page = pdfDoc.getPages()[pageNumber - 1];

                const pngImage = await pdfDoc.embedPng(input.trimmedImg);

                page.drawImage(pngImage, {
                    x: (input.location.x / documentScale),
                    y: oppositeY - (documentState.pageGap / documentScale),
                    width: (input.size.width / documentScale),
                    height: (input.size.height / documentScale)
                })
            }

            const newPDFBytes = await pdfDoc.save()

            if (typeof props.options?.onDocumentSaved !== 'undefined') {
                props.options.onDocumentSaved(newPDFBytes, inputLocations)
            }

            setInputLocations([])

            await renderPDFDocument(newPDFBytes)
        }
    }

    async function setPage(page: number): Promise<void> {
        if (page > documentState.numOfPages || page < 1) {
            return
        }

        (document.getElementById(`signature-document-canvas-box-${page}`) as HTMLElement).scrollIntoView();
    }

    //Finds out what page we are currently scrolled on.
    const checkPageScroll = debounce(100, (func: any): void => {
        const currentScrollHeight = document.getElementById('signature-document-box')?.scrollTop
        if (typeof currentScrollHeight !== 'undefined') {
            const currentPage = Math.floor(((currentScrollHeight + (documentState.pageHeight / 2)) / (documentState.pageHeight + documentState.pageGap)) + 1)
            if (currentPage <= documentState.numOfPages && currentPage >= 1) {
                func({
                    ...documentState,
                    currentScrolledPage: currentPage
                })
            }
        }
    });

    return (
        <div id="signature-document-box" className={classes.documentBox} onScroll={() => { checkPageScroll(setDocumentState); }}>
            <SignatureToolbar setPage={setPage} currentPage={documentState.currentScrolledPage} prevPage={prevPage} nextPage={nextPage} saveDocument={saveDocument} scale={documentScale} decreaseScale={decreaseScale} increaseScale={increaseScale} addInput={addInput} />
            <div id="signature-document-canvas-box" className={classes.documetCanvasBox}>
                {inputLocations.map((input: InputLocation) => {
                    return (
                        <Rnd
                            className={classes.draggableInputBox}
                            key={input.id}
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
                            <img width={input.size.width} height={input.size.height} draggable={false} src={input.trimmedImg} />
                        </Rnd>
                    )
                })}
            </div>
            <br />
        </div>
    )
}