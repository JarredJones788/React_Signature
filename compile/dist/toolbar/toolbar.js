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
const core_1 = require("@material-ui/core");
const AddCircleTwoTone_1 = __importDefault(require("@material-ui/icons/AddCircleTwoTone"));
const RemoveCircleTwoTone_1 = __importDefault(require("@material-ui/icons/RemoveCircleTwoTone"));
const GestureTwoTone_1 = __importDefault(require("@material-ui/icons/GestureTwoTone"));
const SaveTwoTone_1 = __importDefault(require("@material-ui/icons/SaveTwoTone"));
const ArrowBackTwoTone_1 = __importDefault(require("@material-ui/icons/ArrowBackTwoTone"));
const ArrowForwardTwoTone_1 = __importDefault(require("@material-ui/icons/ArrowForwardTwoTone"));
const TextFieldsTwoTone_1 = __importDefault(require("@material-ui/icons/TextFieldsTwoTone"));
const draw_1 = __importDefault(require("../draw/draw"));
const styles = core_1.makeStyles({
    toolbar: {
        position: "sticky",
        top: 0,
        background: "#14213d",
        height: "50px",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        paddingLeft: "10px",
        paddingRight: "10px",
        WebkitBoxShadow: "0 8px 17px 2px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)",
        boxShadow: "0 8px 17px 2px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)"
    },
    flexGrow: {
        flexGrow: 1
    },
    iconButton: {
        padding: 0
    },
    scaleText: {
        color: "white"
    }
});
function SignatureToolbar(props) {
    const classes = styles();
    const [signatureOpen, setSignatureOpen] = react_1.useState(false);
    function toggleSignature() {
        setSignatureOpen(!signatureOpen);
    }
    return (react_1.default.createElement("div", { className: `${classes.toolbar}` },
        react_1.default.createElement(draw_1.default, { toggle: toggleSignature, show: signatureOpen, save: props.addInput }),
        react_1.default.createElement(core_1.IconButton, { className: classes.iconButton, onClick: props.saveDocument },
            react_1.default.createElement(SaveTwoTone_1.default, { fontSize: "large", style: { color: "green" } })),
        react_1.default.createElement(core_1.IconButton, { className: classes.iconButton, onClick: toggleSignature },
            react_1.default.createElement(GestureTwoTone_1.default, { fontSize: "large", style: { color: "orange" } })),
        react_1.default.createElement(core_1.IconButton, { className: classes.iconButton },
            react_1.default.createElement(TextFieldsTwoTone_1.default, { fontSize: "large", style: { color: "orange" } })),
        react_1.default.createElement("div", { className: classes.flexGrow }),
        react_1.default.createElement(core_1.IconButton, { className: classes.iconButton, onClick: props.prevPage },
            react_1.default.createElement(ArrowBackTwoTone_1.default, { fontSize: "large", style: { color: "green" } })),
        react_1.default.createElement("p", { className: classes.scaleText }, props.currentPage),
        react_1.default.createElement(core_1.IconButton, { className: classes.iconButton, onClick: props.nextPage },
            react_1.default.createElement(ArrowForwardTwoTone_1.default, { fontSize: "large", style: { color: "green" } })),
        react_1.default.createElement("div", { className: classes.flexGrow }),
        react_1.default.createElement(core_1.IconButton, { onClick: props.decreaseScale, className: classes.iconButton },
            react_1.default.createElement(RemoveCircleTwoTone_1.default, { fontSize: "large", style: { color: "red" } })),
        react_1.default.createElement("p", { className: classes.scaleText }, `${(props.scale * 100).toFixed(0)}%`),
        react_1.default.createElement(core_1.IconButton, { onClick: props.increaseScale, className: classes.iconButton },
            react_1.default.createElement(AddCircleTwoTone_1.default, { fontSize: "large", style: { color: "green" } }))));
}
exports.default = SignatureToolbar;
