/// <reference types="react" />
interface IProps {
    addInput: (img: string) => void;
    increaseScale: () => Promise<void>;
    decreaseScale: () => Promise<void>;
    saveDocument: () => Promise<void>;
    nextPage: () => Promise<void>;
    prevPage: () => Promise<void>;
    currentPage: number;
    scale: number;
}
export default function SignatureToolbar(props: IProps): JSX.Element;
export {};
