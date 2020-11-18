import React, { useEffect, useState } from 'react';
import MultiPageViewer from './viewers/multiPageViewer';
import SinglePageViewer from './viewers/singlePageViewer';

interface DocumentOptions {
    pageGap?: number;
    scale?: number;
}

interface IProps {
    file: ArrayBuffer | Uint8Array;
    options?: DocumentOptions;
    multiPageSizeLimitKB?: number;
    className?: string;
    style?: React.CSSProperties;
}

export default function PDFDocument(props: IProps) {

    const [viewer, setViewer] = useState<JSX.Element | null>(null);

    useEffect(() => {

        //MultiPage Viewer is used for smaller files.
        //This is the limit in KB at which it will switch to the single page viewer.
        const multiPageSizeLimitKB = typeof props.multiPageSizeLimitKB === 'undefined' ? 60 : props.multiPageSizeLimitKB;

        if (props.file instanceof ArrayBuffer) {
            const kb = (props.file.byteLength / 1000);
            if (kb >= multiPageSizeLimitKB) {
                setViewer(<SinglePageViewer file={props.file} options={props.options} />)
            } else {
                setViewer(<MultiPageViewer file={props.file} options={props.options} />)
            }
        } else if (props.file instanceof Uint8Array) {
            const kb = (props.file.length / 1000);
            if (kb >= multiPageSizeLimitKB) {
                setViewer(<SinglePageViewer file={props.file} options={props.options} />)
            } else {
                setViewer(<MultiPageViewer file={props.file} options={props.options} />)
            }
        }

    }, [])

    return (
        <div className={props.className} style={props.style}>
            {viewer}
        </div>
    )
}