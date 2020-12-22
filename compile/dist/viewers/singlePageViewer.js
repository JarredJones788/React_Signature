"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const pdfjs = __importStar(require("pdfjs-dist"));
const pdf_lib_1 = require("pdf-lib");
const react_rnd_1 = require("react-rnd");
const core_1 = require("@material-ui/core");
const toolbar_1 = __importDefault(require("../toolbar/toolbar"));
const styles = core_1.makeStyles({
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
});
function SinglePageViewer(props) {
    var _a, _b, _c;
    const classes = styles();
    const [documentScale, setDocumentScale] = react_1.useState(typeof ((_a = props.options) === null || _a === void 0 ? void 0 : _a.scale) === 'undefined' ? 1.2 : props.options.scale);
    const [documentState, setDocumentState] = react_1.useState({
        pdfBytes: props.file,
        loading: false,
        numOfPages: 0,
        currentPage: typeof ((_b = props.options) === null || _b === void 0 ? void 0 : _b.startPage) === 'undefined' ? 1 : props.options.startPage,
        pageHeight: 0,
    });
    const [inputLocations, setInputLocations] = react_1.useState(typeof ((_c = props.options) === null || _c === void 0 ? void 0 : _c.inputLocations) === 'undefined' ? [] : props.options.inputLocations);
    react_1.useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
        renderPDFDocument(documentState.pdfBytes).then(() => {
            var _a;
            if (typeof ((_a = props.options) === null || _a === void 0 ? void 0 : _a.onDocumentLoaded) !== 'undefined') {
                props.options.onDocumentLoaded();
            }
        });
    }, []);
    //Render the entire PDF document
    function renderPDFDocument(data, scale, currentPage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!documentState.loading) {
                    setDocumentState(Object.assign(Object.assign({}, documentState), { loading: true }));
                    let pdf = yield pdfjs.getDocument(data).promise;
                    if (pdf.numPages <= 0) {
                        throw new Error("No pages found");
                    }
                    if (typeof scale === 'undefined') {
                        scale = documentScale;
                    }
                    if (typeof currentPage === 'undefined') {
                        currentPage = documentState.currentPage;
                    }
                    setDocumentScale(scale);
                    //Remove all child nodes that are not inputs. IE: draggable boxes.
                    const parentDocumentCanvas = document.getElementById('signature-document-canvas-box');
                    for (let i in parentDocumentCanvas.childNodes) {
                        const node = parentDocumentCanvas.childNodes[i];
                        if (!node)
                            continue;
                        if (typeof node === 'object') {
                            if (node.id !== "doucment-draggable-input-box") {
                                node.remove();
                            }
                        }
                    }
                    const canvasElement = document.createElement("CANVAS");
                    canvasElement.id = `signature-document-canvas-box`;
                    canvasElement.className = `${classes.documentCanvas}`;
                    const context = canvasElement.getContext('2d');
                    if (context) {
                        //Fetch current page and adjust parent div to viewport width and height.
                        let page = yield pdf.getPage(currentPage);
                        var viewport = page.getViewport({ scale: scale });
                        canvasElement.height = viewport.height;
                        canvasElement.width = viewport.width;
                        let ele = document.getElementById('signature-document-canvas-box');
                        ele.style.width = viewport.width + "px";
                        ele.style.height = viewport.height + "px";
                        ele.appendChild(canvasElement);
                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport,
                        };
                        yield page.render(renderContext).promise;
                        setDocumentState(Object.assign(Object.assign({}, documentState), { pageHeight: Math.floor(viewport.height), pdfBytes: data, loading: false, currentPage, numOfPages: pdf.numPages }));
                    }
                }
            }
            catch (err) {
                console.log(err);
                setDocumentState(Object.assign(Object.assign({}, documentState), { loading: false }));
            }
        });
    }
    function addInput(data) {
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
            });
            setInputLocations([...inputLocations]);
        };
    }
    function increaseScale() {
        return __awaiter(this, void 0, void 0, function* () {
            yield renderPDFDocument(documentState.pdfBytes, documentScale + 0.1);
        });
    }
    function decreaseScale() {
        return __awaiter(this, void 0, void 0, function* () {
            yield renderPDFDocument(documentState.pdfBytes, documentScale - 0.1);
        });
    }
    function nextPage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (documentState.currentPage + 1 > documentState.numOfPages) {
                return;
            }
            yield renderPDFDocument(documentState.pdfBytes, documentScale, documentState.currentPage + 1);
        });
    }
    function prevPage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (documentState.currentPage - 1 < 1) {
                return;
            }
            yield renderPDFDocument(documentState.pdfBytes, documentScale, documentState.currentPage - 1);
        });
    }
    function saveDocument() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (documentState.pdfBytes) {
                const inputs = inputLocations;
                const pdfDoc = yield pdf_lib_1.PDFDocument.load(documentState.pdfBytes);
                for (var i in inputs) {
                    const input = inputs[i];
                    if (!input) {
                        continue;
                    }
                    //Get the bottom left corner of the input box.
                    const finalY = (input.location.y / documentScale) + (input.size.height / documentScale);
                    //Flip the Y cordinate to the opposite. Since PDF-lib Y cordinate starts at the bottom left of the page.
                    const oppositeY = Math.abs((documentState.pageHeight / documentScale) - finalY);
                    const page = pdfDoc.getPages()[input.page - 1];
                    const pngImage = yield pdfDoc.embedPng(input.trimmedImg);
                    page.drawImage(pngImage, {
                        x: (input.location.x / documentScale),
                        y: oppositeY,
                        width: (input.size.width / documentScale),
                        height: (input.size.height / documentScale)
                    });
                }
                const newPDFBytes = yield pdfDoc.save();
                if (typeof ((_a = props.options) === null || _a === void 0 ? void 0 : _a.onDocumentSaved) !== 'undefined') {
                    props.options.onDocumentSaved(newPDFBytes, inputLocations);
                }
                setInputLocations([]);
                yield renderPDFDocument(newPDFBytes);
            }
        });
    }
    return (react_1.default.createElement("div", { id: "signature-document-box", className: classes.documentBox },
        react_1.default.createElement(toolbar_1.default, { currentPage: documentState.currentPage, prevPage: prevPage, nextPage: nextPage, saveDocument: saveDocument, scale: documentScale, decreaseScale: decreaseScale, increaseScale: increaseScale, addInput: addInput }),
        react_1.default.createElement("div", { id: "signature-document-canvas-box", className: classes.documetCanvasBox }, inputLocations.map((input) => {
            return (react_1.default.createElement(react_rnd_1.Rnd, { id: "doucment-draggable-input-box", style: { display: input.page === documentState.currentPage ? "block" : "none" }, className: classes.draggableInputBox, key: input.id, onDragStop: (e, d) => { input.location = { x: d.x, y: d.y }; }, onResizeStop: (e, dir, ref) => { input.size = { height: ref.offsetHeight, width: ref.offsetWidth }; setInputLocations([...inputLocations]); }, default: {
                    x: input.location.x,
                    y: input.location.y,
                    width: input.size.width,
                    height: input.size.height,
                }, size: { width: input.size.width, height: input.size.height } },
                react_1.default.createElement("img", { width: input.size.width, height: input.size.height, draggable: false, src: input.trimmedImg })));
        })),
        react_1.default.createElement("br", null)));
}
exports.default = SinglePageViewer;
