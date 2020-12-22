/// <reference types="react" />
import { DocumentOptions } from '../document';
interface IProps {
    file: ArrayBuffer | Uint8Array;
    options?: DocumentOptions;
}
export default function MultiPageViewer(props: IProps): JSX.Element;
export {};
