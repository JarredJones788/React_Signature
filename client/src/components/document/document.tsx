import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import MultiPageViewer from './viewers/multiPageViewer';
import SinglePageViewer from './viewers/singlePageViewer';


interface IProps {
    file: ArrayBuffer | Uint8Array;
}

export default function PDFDocument(props: IProps) {

    const [viewer, setViewer] = useState<JSX.Element | null>(null);

    useEffect(() => {

        pdfjs.GlobalWorkerOptions.workerSrc = `/js/pdf.worker.js`;

        pdfjs.getDocument(props.file).promise.then((document: pdfjs.PDFDocumentProxy) => {
            if (document.numPages > 5) {
                setViewer(<SinglePageViewer file={props.file} />)
            } else {
                setViewer(<MultiPageViewer file={props.file} />)
            }
        });
    }, [])

    return (
        <div style={{ padding: "20px", height: "calc(100vh - 40px)" }}>
            {viewer}
        </div>
    )
}