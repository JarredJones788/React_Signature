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
const styles_1 = require("@material-ui/core/styles");
const Modal_1 = __importDefault(require("@material-ui/core/Modal"));
const react_signature_canvas_1 = __importDefault(require("react-signature-canvas"));
const Fab_1 = __importDefault(require("@material-ui/core/Fab"));
const Clear_1 = __importDefault(require("@material-ui/icons/Clear"));
const Check_1 = __importDefault(require("@material-ui/icons/Check"));
function getModalStyle() {
    return {
        top: `20em`,
        margin: "auto",
        left: '50%',
        transform: 'translate(-50%, -50%)'
    };
}
const useStyles = styles_1.makeStyles((theme) => styles_1.createStyles({
    paper: {
        position: 'absolute',
        textAlign: 'center',
        width: "60%",
        minWidth: "325px",
        backgroundColor: "#121212",
        outline: 'none',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    modal: {},
    modalHeader: {
        textAlign: "center",
        color: "white"
    },
    labelColor: {
        color: "white"
    },
    input: {
        color: "white",
    },
    button: {
        backgroundColor: "green",
        color: 'white',
    },
    drawCanvas: {
        background: "white",
        width: "100%",
        height: "50vh"
    },
    drawBtnClear: {
        position: "absolute",
        right: "3em",
        top: "2em",
        backgroundColor: "red !important",
        color: "white !important",
    },
    drawBtnSave: {
        position: "absolute",
        right: "3em",
        top: "6em",
        backgroundColor: "green !important",
        color: "white !important",
    }
}));
function DrawModal(props) {
    const classes = useStyles();
    const [modalStyle] = react_1.useState(getModalStyle);
    const [lastDrawn, setLastDrawn] = react_1.useState("");
    let drawRef = null;
    function clear() {
        drawRef.clear();
    }
    function save() {
        if (drawRef.isEmpty()) {
            return;
        }
        let canv = drawRef.getTrimmedCanvas();
        const trimmed = canv.toDataURL();
        const original = drawRef.toDataURL();
        props.save({ trimmed, original });
        setLastDrawn(original);
        props.toggle();
    }
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(Modal_1.default, { className: classes.modal, open: props.show, onClose: props.toggle },
            react_1.default.createElement("div", { style: modalStyle, className: classes.paper + " mobile-draw-width" },
                react_1.default.createElement(Fab_1.default, { onClick: clear, className: classes.drawBtnClear, size: "small" },
                    react_1.default.createElement(Clear_1.default, null)),
                react_1.default.createElement(Fab_1.default, { onClick: save, className: classes.drawBtnSave, size: "small" },
                    react_1.default.createElement(Check_1.default, null)),
                react_1.default.createElement(react_signature_canvas_1.default, { maxWidth: 6, ref: (ref) => { var _a; drawRef = ref; (_a = ref) === null || _a === void 0 ? void 0 : _a.fromDataURL(lastDrawn); }, clearOnResize: false, canvasProps: { id: "drawCanvas", className: classes.drawCanvas } })))));
}
exports.default = DrawModal;
