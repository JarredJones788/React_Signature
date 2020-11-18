import React from 'react';
import { IconButton, makeStyles } from '@material-ui/core';
import AddCircleTwoToneIcon from '@material-ui/icons/AddCircleTwoTone';
import RemoveCircleTwoToneIcon from '@material-ui/icons/RemoveCircleTwoTone';
import GestureTwoToneIcon from '@material-ui/icons/GestureTwoTone';

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
        paddingLeft: "20px",
        paddingRight: "20px"
    },
    flexGrow: {
        flexGrow: 1
    },
    iconButton: {
        padding: 0
    }
})

interface IProps {
    addInput: () => void;
    increaseScale: () => Promise<void>;
    decreaseScale: () => Promise<void>;
}

export default function SignatureToolbar(props: IProps) {
    const classes = styles()

    return (
        <div className={`${classes.toolbar} z-depth-2`}>
            <IconButton className={classes.iconButton} onClick={props.addInput}>
                <GestureTwoToneIcon fontSize="large" style={{ color: "green" }} />
            </IconButton>
            <div className={classes.flexGrow}></div>
            <IconButton onClick={props.decreaseScale} className={classes.iconButton}>
                <RemoveCircleTwoToneIcon fontSize="large" style={{ color: "red" }} />
            </IconButton>
            <IconButton onClick={props.increaseScale} className={classes.iconButton}>
                <AddCircleTwoToneIcon fontSize="large" style={{ color: "green" }} />
            </IconButton>
        </div>
    );
}
