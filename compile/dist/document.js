"use strict";
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
const multiPageViewer_1 = __importDefault(require("./viewers/multiPageViewer"));
const singlePageViewer_1 = __importDefault(require("./viewers/singlePageViewer"));
function PDFViewer(props) {
    const [viewer, setViewer] = react_1.useState(null);
    react_1.useEffect(() => {
        var _a, _b;
        //MultiPage Viewer is used for smaller files.
        //This is the limit in KB at which it will switch to the single page viewer.
        const multiPageSizeLimitKB = typeof ((_a = props.options) === null || _a === void 0 ? void 0 : _a.multiPageSizeLimitKB) === 'undefined' ? 60 : (_b = props.options) === null || _b === void 0 ? void 0 : _b.multiPageSizeLimitKB;
        if (props.file instanceof ArrayBuffer) {
            const kb = (props.file.byteLength / 1000);
            if (kb >= multiPageSizeLimitKB) {
                setViewer(react_1.default.createElement(singlePageViewer_1.default, { file: props.file, options: props.options }));
            }
            else {
                setViewer(react_1.default.createElement(multiPageViewer_1.default, { file: props.file, options: props.options }));
            }
        }
        else if (props.file instanceof Uint8Array) {
            const kb = (props.file.length / 1000);
            if (kb >= multiPageSizeLimitKB) {
                setViewer(react_1.default.createElement(singlePageViewer_1.default, { file: props.file, options: props.options }));
            }
            else {
                setViewer(react_1.default.createElement(multiPageViewer_1.default, { file: props.file, options: props.options }));
            }
        }
        else {
            setViewer(null);
        }
    }, []);
    return (react_1.default.createElement("div", { className: props.className, style: props.style }, viewer));
}
exports.default = PDFViewer;
