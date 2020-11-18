import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { PDFRenderParams } from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib'
import { Rnd } from 'react-rnd';
import { makeStyles } from '@material-ui/core';
import SignatureToolbar from '../toolbar/toolbar';

interface InputLocation {
    id: string;
    location: { x: number, y: number };
    size: { width: number, height: number }
}

interface DocumentOptions {
    scale?: number;
}

interface IProps {
    file: ArrayBuffer | Uint8Array;
    options?: DocumentOptions;
}

const styles = makeStyles({
    documentBox: {
        height: "100%",
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

export default function SinglePageViewer(props: IProps) {

    const classes = styles();

    const [documentScale, setDocumentScale] = useState(typeof props.options?.scale === 'undefined' ? 1.2 : props.options.scale,)

    const [documentState, setDocumentState] = useState({
        pdfBytes: props.file,
        loading: false,
        numOfPages: 0,
        currentPage: 1,
        pageHeight: 0,
    })

    //TEST Signature
    const [testSig, setTestSig] = useState<string>('')

    const [inputLocations, setInputLocations] = useState<InputLocation[]>([])

    useEffect(() => {

        pdfjs.GlobalWorkerOptions.workerSrc = `/js/pdf.worker.js`;

        renderPDFDocument(documentState.pdfBytes).then(async () => {
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


                setDocumentScale(scale);

                //remove canvas and re-render.
                (document.getElementById('signature-document-canvas-box') as HTMLElement).innerHTML = '';

                const canvasElement = document.createElement("CANVAS") as HTMLCanvasElement;

                canvasElement.id = `signature-document-canvas-box`
                canvasElement.className = `${classes.documentCanvas} z-depth-3`;

                const context = canvasElement.getContext('2d');

                if (context) {

                    //Fetch first page and adjust parent div to viewport width and height.
                    let page = await pdf.getPage(documentState.currentPage);
                    var viewport = page.getViewport({ scale: scale });

                    canvasElement.height = viewport.height;
                    canvasElement.width = viewport.width;

                    let ele = document.getElementById('signature-document-canvas-box') as HTMLElement;
                    ele.style.width = viewport.width + "px";
                    ele.style.height = viewport.height + "px";
                    ele.appendChild(canvasElement)

                    const renderContext: PDFRenderParams = {
                        canvasContext: context,
                        viewport: viewport,
                    };

                    await page.render(renderContext).promise;

                    setDocumentState({
                        ...documentState,
                        pageHeight: Math.floor(viewport.height),
                        pdfBytes: data,
                        loading: false,
                        numOfPages: pdf.numPages
                    })
                }

            }

        } catch (err) {
            console.log(err)
            setDocumentState({
                ...documentState,
                loading: false
            })

        }
    }

    async function signPDF(input: InputLocation): Promise<void> {

        if (documentState.pdfBytes) {

            //Get the bottom left corner of the input box.
            const finalY = (input.location.y / documentScale) + (input.size.height / documentScale);

            //Flip the Y cordinate to the opposite. Since PDF-lib Y cordinate starts at the bottom left of the page.
            const oppositeY = Math.abs((documentState.pageHeight / documentScale) - finalY);

            const pdfDoc = await PDFDocument.load(documentState.pdfBytes)

            const page = pdfDoc.getPages()[documentState.currentPage - 1];

            const pngImage = await pdfDoc.embedPng(testSig);

            page.drawImage(pngImage, {
                x: (input.location.x / documentScale),
                y: oppositeY,
                width: (input.size.width / documentScale),
                height: (input.size.height / documentScale)
            })

            const newPDFBytes = await pdfDoc.save()

            await renderPDFDocument(newPDFBytes)

        }
    }

    function addInput(): void {

        inputLocations.push({
            id: Math.random().toString(),
            location: { x: 250, y: 250 },
            size: { width: 100 * documentScale, height: 100 * documentScale }
        })

        setInputLocations([...inputLocations])
    }

    async function increaseScale(): Promise<void> {
        await renderPDFDocument(documentState.pdfBytes, documentScale + 0.1)
    }

    async function decreaseScale(): Promise<void> {
        await renderPDFDocument(documentState.pdfBytes, documentScale - 0.1)
    }


    return (
        <div id="signature-document-box" className={classes.documentBox}>
            <SignatureToolbar scale={documentScale} decreaseScale={decreaseScale} increaseScale={increaseScale} addInput={addInput} />
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