import React, { useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFRenderParams } from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib'
import { Rnd } from 'react-rnd';
import { makeStyles } from '@material-ui/core';
import SignatureToolbar from '../toolbar/toolbar';
import { DocumentOptions, InputLocation } from '../document';


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
        WebkitBoxShadow: "0 8px 17px 2px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)",
        boxShadow: "0 8px 17px 2px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)"
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
        currentPage: typeof props.options?.startPage === 'undefined' ? 1 : props.options.startPage,
        pageHeight: 0,
    })

    const [inputLocations, setInputLocations] = useState<InputLocation[]>(typeof props.options?.inputLocations === 'undefined' ? [] : props.options.inputLocations)

    useEffect(() => {

        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

        renderPDFDocument(documentState.pdfBytes).then(() => {
            if (typeof props.options?.onDocumentLoaded !== 'undefined') {
                props.options.onDocumentLoaded()
            }
        })

    }, [])

    //Render the entire PDF document
    async function renderPDFDocument(data: ArrayBuffer, scale?: number, currentPage?: number): Promise<void> {
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

                if (typeof currentPage === 'undefined') {
                    currentPage = documentState.currentPage;
                }

                setDocumentScale(scale);

                //Remove all child nodes that are not inputs. IE: draggable boxes.
                const parentDocumentCanvas = document.getElementById('signature-document-canvas-box') as HTMLElement;
                for (let i in parentDocumentCanvas.childNodes) {
                    const node = parentDocumentCanvas.childNodes[i];
                    if (!node) continue;
                    if (typeof node === 'object') {
                        if ((node as HTMLElement).id !== "doucment-draggable-input-box") {
                            node.remove()
                        }
                    }
                }

                const canvasElement = document.createElement("CANVAS") as HTMLCanvasElement;

                canvasElement.id = `signature-document-canvas-box`
                canvasElement.className = `${classes.documentCanvas}`;

                const context = canvasElement.getContext('2d');

                if (context) {

                    //Fetch current page and adjust parent div to viewport width and height.
                    let page = await pdf.getPage(currentPage);
                    var viewport = page.getViewport({ scale: scale });

                    canvasElement.height = viewport.height;
                    canvasElement.width = viewport.width;

                    let ele = document.getElementById('signature-document-canvas-box') as HTMLElement;
                    ele.style.width = viewport.width + "px";
                    ele.style.height = viewport.height + "px";
                    ele.appendChild(canvasElement)

                    const textContent = await page.getTextContent();

                    const renderContext: PDFRenderParams = {
                        canvasContext: context,
                        viewport: viewport
                    };

                    await page.render(renderContext).promise;

                    setDocumentState({
                        ...documentState,
                        pageHeight: Math.floor(viewport.height),
                        pdfBytes: data,
                        loading: false,
                        currentPage,
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

    function addInput(data: any): void {

        const img = new Image();

        img.src = data.trimmed;

        img.onload = function () {
            inputLocations.push({
                id: Math.random().toString(),
                location: { x: 250, y: 250 },
                size: { width: 100 * documentScale, height: 100 * documentScale },
                trimmedImg: data.trimmed,
                originalImg: data.original,
                page: documentState.currentPage
            })

            setInputLocations([...inputLocations])

        };
    }

    async function increaseScale(): Promise<void> {
        await renderPDFDocument(documentState.pdfBytes, documentScale + 0.1)
    }

    async function decreaseScale(): Promise<void> {
        await renderPDFDocument(documentState.pdfBytes, documentScale - 0.1)
    }

    async function nextPage(): Promise<void> {
        if (documentState.currentPage + 1 > documentState.numOfPages) {
            return;
        }

        await renderPDFDocument(documentState.pdfBytes, documentScale, documentState.currentPage + 1)
    }

    async function prevPage(): Promise<void> {
        if (documentState.currentPage - 1 < 1) {
            return;
        }

        await renderPDFDocument(documentState.pdfBytes, documentScale, documentState.currentPage - 1)
    }

    async function saveDocument(): Promise<void> {


        if (documentState.pdfBytes) {
            const inputs = inputLocations;

            const pdfDoc = await PDFDocument.load(documentState.pdfBytes)

            for (var i in inputs) {
                const input = inputs[i];
                if (!input) { continue }

                //Get the bottom left corner of the input box.
                const finalY = (input.location.y / documentScale) + (input.size.height / documentScale);

                //Flip the Y cordinate to the opposite. Since PDF-lib Y cordinate starts at the bottom left of the page.
                const oppositeY = Math.abs((documentState.pageHeight / documentScale) - finalY);

                const page = pdfDoc.getPages()[input.page - 1];

                const pngImage = await pdfDoc.embedPng(input.trimmedImg);

                page.drawImage(pngImage, {
                    x: (input.location.x / documentScale),
                    y: oppositeY,
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

        await renderPDFDocument(documentState.pdfBytes, documentScale, page)
    }

    return (
        <div id="signature-document-box" className={classes.documentBox}>
            <SignatureToolbar setPage={setPage} currentPage={documentState.currentPage} prevPage={prevPage} nextPage={nextPage} saveDocument={saveDocument} scale={documentScale} decreaseScale={decreaseScale} increaseScale={increaseScale} addInput={addInput} />
            <div id="signature-document-canvas-box" className={classes.documetCanvasBox}>
                {inputLocations.map((input: InputLocation) => {
                    return (
                        <Rnd
                            id="doucment-draggable-input-box"
                            style={{ display: input.page === documentState.currentPage ? "block" : "none" }}
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