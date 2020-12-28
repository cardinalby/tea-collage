import React from "react";

interface TeapotSpinnerProps {
    preview?: boolean
}

function TeapotSpinner(props: TeapotSpinnerProps) {
    return (
        <div className={`teapot-spinner ${props.preview ? 'preview' : ''}`}>
            <img src={process.env.PUBLIC_URL + 'favicon.png'} alt={'Loading...'}/>
        </div>
    );
}

export default TeapotSpinner;