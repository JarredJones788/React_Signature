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
const throttle_debounce_1 = require("throttle-debounce");
const toolbar_1 = __importDefault(require("../toolbar/toolbar"));
const styles = core_1.makeStyles({
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
});
function MultiPageViewer(props) {
    var _a, _b, _c, _d;
    const classes = styles();
    const [documentScale, setDocumentScale] = react_1.useState(typeof ((_a = props.options) === null || _a === void 0 ? void 0 : _a.scale) === 'undefined' ? 1.2 : props.options.scale);
    const [documentState, setDocumentState] = react_1.useState({
        pdfBytes: props.file,
        loading: false,
        numOfPages: 0,
        currentScrolledPage: typeof ((_b = props.options) === null || _b === void 0 ? void 0 : _b.startPage) === 'undefined' ? 1 : props.options.startPage,
        pageHeight: 0,
        pageGap: typeof ((_c = props.options) === null || _c === void 0 ? void 0 : _c.pageGap) === 'undefined' ? 15 : props.options.pageGap
    });
    const [inputLocations, setInputLocations] = react_1.useState(typeof ((_d = props.options) === null || _d === void 0 ? void 0 : _d.inputLocations) === 'undefined' ? [] : props.options.inputLocations);
    react_1.useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
        renderPDFDocument(documentState.pdfBytes).then(() => {
            var _a;
            if (documentState.currentScrolledPage > 1) {
                document.getElementById(`signature-document-canvas-box-${documentState.currentScrolledPage}`).scrollIntoView();
            }
            if (typeof ((_a = props.options) === null || _a === void 0 ? void 0 : _a.onDocumentLoaded) !== 'undefined') {
                props.options.onDocumentLoaded();
            }
        });
    }, []);
    //Render the entire PDF document
    function renderPDFDocument(data, scale) {
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
                    //Fetch first page and adjust parent div to viewport width and height.
                    let page = yield pdf.getPage(1);
                    var viewport = page.getViewport({ scale: scale });
                    let ele = document.getElementById('signature-document-canvas-box');
                    ele.style.width = viewport.width + "px";
                    ele.style.height = ((viewport.height * pdf.numPages) + (documentState.pageGap * pdf.numPages)) + "px";
                    //remove all canvases and re-render.
                    document.getElementById('signature-document-canvas-box').innerHTML = '';
                    setDocumentScale(scale);
                    //Draw all of the new canvases for the document.
                    for (var i = 1; i <= pdf.numPages; i++) {
                        const canvasElement = document.createElement("CANVAS");
                        canvasElement.id = `signature-document-canvas-box-${i}`;
                        canvasElement.className = `${classes.documentCanvas}`;
                        canvasElement.style.marginBottom = `${documentState.pageGap}px`;
                        const context = canvasElement.getContext('2d');
                        if (context) {
                            const page = yield pdf.getPage(i);
                            const viewport = page.getViewport({ scale: scale });
                            canvasElement.height = viewport.height;
                            canvasElement.width = viewport.width;
                            let ele = document.getElementById('signature-document-canvas-box');
                            ele.appendChild(canvasElement);
                            const renderContext = {
                                canvasContext: context,
                                viewport: viewport,
                            };
                            yield page.render(renderContext).promise;
                        }
                    }
                    setDocumentState(Object.assign(Object.assign({}, documentState), { pageHeight: Math.floor(viewport.height), pdfBytes: data, loading: false, numOfPages: pdf.numPages }));
                }
            }
            catch (err) {
                console.log(err);
                setDocumentState(Object.assign(Object.assign({}, documentState), { loading: false }));
            }
        });
    }
    function addInput(data) {
        const scrollBox = document.getElementById('signature-document-box');
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
                });
                setInputLocations([...inputLocations]);
            };
        }
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
            if (documentState.currentScrolledPage + 1 > documentState.numOfPages) {
                return;
            }
            document.getElementById(`signature-document-canvas-box-${documentState.currentScrolledPage + 1}`).scrollIntoView();
        });
    }
    function prevPage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (documentState.currentScrolledPage - 1 < 1) {
                return;
            }
            document.getElementById(`signature-document-canvas-box-${documentState.currentScrolledPage - 1}`).scrollIntoView();
        });
    }
    function saveDocument() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (documentState.pdfBytes) {
                const inputs = inputLocations;
                const documentHeight = documentState.pageHeight + documentState.pageGap;
                const pdfDoc = yield pdf_lib_1.PDFDocument.load(documentState.pdfBytes);
                for (var i in inputs) {
                    const input = inputs[i];
                    if (!input) {
                        continue;
                    }
                    //Get the current page the input box is on.
                    let pageNumber = Math.ceil(((input.location.y + documentState.pageGap) / documentHeight));
                    if (pageNumber <= 0) {
                        pageNumber = 1;
                    }
                    //Y cordinate on the current page the input box is on.
                    const currentPageY = (documentHeight - ((documentHeight * pageNumber) - input.location.y));
                    //Get the bottom left corner of the input box.
                    const finalY = (currentPageY / documentScale) + (input.size.height / documentScale);
                    //Flip the Y cordinate to the opposite. Since PDF-lib Y cordinate starts at the bottom left of the page.
                    const oppositeY = Math.abs((documentHeight / documentScale) - finalY);
                    const page = pdfDoc.getPages()[pageNumber - 1];
                    const pngImage = yield pdfDoc.embedPng(input.trimmedImg);
                    page.drawImage(pngImage, {
                        x: (input.location.x / documentScale),
                        y: oppositeY - (documentState.pageGap / documentScale),
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
    //Finds out what page we are currently scrolled on.
    const checkPageScroll = throttle_debounce_1.debounce(100, (func) => {
        var _a;
        const currentScrollHeight = (_a = document.getElementById('signature-document-box')) === null || _a === void 0 ? void 0 : _a.scrollTop;
        if (typeof currentScrollHeight !== 'undefined') {
            const currentPage = Math.floor(((currentScrollHeight + (documentState.pageHeight / 2)) / (documentState.pageHeight + documentState.pageGap)) + 1);
            if (currentPage <= documentState.numOfPages && currentPage >= 1) {
                func(Object.assign(Object.assign({}, documentState), { currentScrolledPage: currentPage }));
            }
        }
    });
    return (react_1.default.createElement("div", { id: "signature-document-box", className: classes.documentBox, onScroll: () => { checkPageScroll(setDocumentState); } },
        react_1.default.createElement(toolbar_1.default, { currentPage: documentState.currentScrolledPage, prevPage: prevPage, nextPage: nextPage, saveDocument: saveDocument, scale: documentScale, decreaseScale: decreaseScale, increaseScale: increaseScale, addInput: addInput }),
        react_1.default.createElement("div", { id: "signature-document-canvas-box", className: classes.documetCanvasBox }, inputLocations.map((input) => {
            return (react_1.default.createElement(react_rnd_1.Rnd, { className: classes.draggableInputBox, key: input.id, onDragStop: (e, d) => { input.location = { x: d.x, y: d.y }; }, onResizeStop: (e, dir, ref) => { input.size = { height: ref.offsetHeight, width: ref.offsetWidth }; setInputLocations([...inputLocations]); }, default: {
                    x: input.location.x,
                    y: input.location.y,
                    width: input.size.width,
                    height: input.size.height,
                }, size: { width: input.size.width, height: input.size.height } },
                react_1.default.createElement("img", { width: input.size.width, height: input.size.height, draggable: false, src: input.trimmedImg })));
        })),
        react_1.default.createElement("br", null)));
}
exports.default = MultiPageViewer;
