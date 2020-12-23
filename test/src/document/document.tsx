import React, { useEffect, useState } from 'react';
import MultiPageViewer from './viewers/multiPageViewer';
import SinglePageViewer from './viewers/singlePageViewer';

export interface DocumentOptions {
    pageGap?: number;
    scale?: number;
    startPage?: number;
    multiPageSizeLimitKB?: number;
    onDocumentSaved?: (file: Uint8Array, inputLocations: InputLocation[]) => void;
    onDocumentLoaded?: () => void;
}

export interface InputLocation {
    id: string;
    location: { x: number, y: number };
    size: { width: number, height: number };
    trimmedImg: string;
    originalImg: string;
    page: number;
}

interface IProps {
    file: ArrayBuffer | Uint8Array;
    options?: DocumentOptions;
    className?: string;
    style?: React.CSSProperties;
}

export default function PDFViewer(props: IProps) {

    const [viewer, setViewer] = useState<JSX.Element | null>(null);

    useEffect(() => {

        //MultiPage Viewer is used for smaller files.
        //This is the limit in KB at which it will switch to the single page viewer.
        const multiPageSizeLimitKB = typeof props.options?.multiPageSizeLimitKB === 'undefined' ? 60 : props.options?.multiPageSizeLimitKB;

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
        } else {
            setViewer(null)
        }

    }, [])

    return (
        <div className={props.className} style={props.style}>
            {viewer}
        </div>
    )
}