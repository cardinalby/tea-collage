import React from "react";

function TeapotSpinner(props) {
    return (
        <div className={`teapot-spinner ${props.preview ? 'preview' : ''}`}>
            <img src={process.env.PUBLIC_URL + 'favicon.png'} />
        </div>
    );
}

export default TeapotSpinner;