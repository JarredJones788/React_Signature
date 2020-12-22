import React, { useState } from 'react';
import { IconButton, makeStyles } from '@material-ui/core';
import AddCircleTwoToneIcon from '@material-ui/icons/AddCircleTwoTone';
import RemoveCircleTwoToneIcon from '@material-ui/icons/RemoveCircleTwoTone';
import GestureTwoToneIcon from '@material-ui/icons/GestureTwoTone';
import SaveTwoToneIcon from '@material-ui/icons/SaveTwoTone';
import ArrowBackTwoToneIcon from '@material-ui/icons/ArrowBackTwoTone';
import ArrowForwardTwoToneIcon from '@material-ui/icons/ArrowForwardTwoTone';
import TextFieldsTwoToneIcon from '@material-ui/icons/TextFieldsTwoTone';
import DrawModal from '../draw/draw';

const styles = makeStyles({
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
})

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

export default function SignatureToolbar(props: IProps) {
    const classes = styles()

    const [signatureOpen, setSignatureOpen] = useState<boolean>(false)

    function toggleSignature() {
        setSignatureOpen(!signatureOpen)
    }

    return (
        <div className={`${classes.toolbar}`}>
            <DrawModal toggle={toggleSignature} show={signatureOpen} save={props.addInput} />
            <IconButton className={classes.iconButton} onClick={props.saveDocument}>
                <SaveTwoToneIcon fontSize="large" style={{ color: "green" }} />
            </IconButton>
            <IconButton className={classes.iconButton} onClick={toggleSignature}>
                <GestureTwoToneIcon fontSize="large" style={{ color: "orange" }} />
            </IconButton>
            <IconButton className={classes.iconButton}>
                <TextFieldsTwoToneIcon fontSize="large" style={{ color: "orange" }} />
            </IconButton>
            <div className={classes.flexGrow}></div>
            <IconButton className={classes.iconButton} onClick={props.prevPage}>
                <ArrowBackTwoToneIcon fontSize="large" style={{ color: "green" }} />
            </IconButton>
            <p className={classes.scaleText}>{props.currentPage}</p>
            <IconButton className={classes.iconButton} onClick={props.nextPage}>
                <ArrowForwardTwoToneIcon fontSize="large" style={{ color: "green" }} />
            </IconButton>
            <div className={classes.flexGrow}></div>
            <IconButton onClick={props.decreaseScale} className={classes.iconButton}>
                <RemoveCircleTwoToneIcon fontSize="large" style={{ color: "red" }} />
            </IconButton>
            <p className={classes.scaleText}>{`${(props.scale * 100).toFixed(0)}%`}</p>
            <IconButton onClick={props.increaseScale} className={classes.iconButton}>
                <AddCircleTwoToneIcon fontSize="large" style={{ color: "green" }} />
            </IconButton>
        </div>
    );
}
