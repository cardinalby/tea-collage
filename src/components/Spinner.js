import React from "react";

function Spinner(props) {
    return (
        //<div className={`lds-dual-ring ${props.dark ? 'dark' : ''}`}/>
        <div className={`teapot-spinner ${props.preview ? 'preview' : ''}`}>
            <img src={process.env.PUBLIC_URL + 'favicon.png'} />
        </div>
    );
}

export default Spinner;