import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import SignatureCanvas from 'react-signature-canvas'
import Fab from '@material-ui/core/Fab';
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';

function getModalStyle() {

    return {
        top: `20em`,
        margin: "auto",
        left: '50%',
        transform: 'translate(-50%, -50%)'
    };
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
        modal: {

        },
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
    }),
);

interface IProps {
    toggle: any;
    show: boolean;
    save: any;
}


export default function DrawModal(props: IProps) {
    const classes = useStyles();

    const [modalStyle] = useState(getModalStyle);

    const [lastDrawn, setLastDrawn] = useState("")

    let drawRef: any = null;

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
        setLastDrawn(original)
        props.toggle()
    }


    return (
        <div>
            <Modal className={classes.modal} open={props.show} onClose={props.toggle} >
                <div style={modalStyle} className={classes.paper + " mobile-draw-width"}>
                    <Fab onClick={clear} className={classes.drawBtnClear} size="small" >
                        <ClearIcon />
                    </Fab>
                    <Fab onClick={save} className={classes.drawBtnSave} size="small" >
                        <CheckIcon />
                    </Fab>
                    <SignatureCanvas maxWidth={6} ref={(ref) => { drawRef = ref; ref?.fromDataURL(lastDrawn) }} clearOnResize={false} canvasProps={{ id: "drawCanvas", className: classes.drawCanvas }} />
                </div>
            </Modal>
        </div>
    );
}