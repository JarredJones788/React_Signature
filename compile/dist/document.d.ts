import React from 'react';
export interface DocumentOptions {
    pageGap?: number;
    scale?: number;
    startPage?: number;
    multiPageSizeLimitKB?: number;
    inputLocations?: InputLocation[];
    onDocumentSaved?: (file: Uint8Array, inputLocations: InputLocation[]) => void;
    onDocumentLoaded?: () => void;
}
export interface InputLocation {
    id: string;
    location: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
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
export default function PDFViewer(props: IProps): JSX.Element;
export {};
