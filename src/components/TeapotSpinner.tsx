import React from "react";
import {classNames} from "../models/reactUtils";

interface TeapotSpinnerProps {
    active: boolean
    preview?: boolean
}

function TeapotSpinner(props: TeapotSpinnerProps) {
    const className = classNames(
        'teapot-spinner',
        props.preview && 'preview',
        props.active ? 'active' : 'hidden'
    );
    return (
        <div className={className}>
            <img src={process.env.PUBLIC_URL + 'favicon.png'} alt={'Loading...'}/>
        </div>
    );
}

export default TeapotSpinner;