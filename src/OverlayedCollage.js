import React from "react";
import ResizeableImageMapper from "./ResizeableImageMapper";
import OverlayLayer from "./OverlayLayer";

function OverlayedCollage(props) {
    let overlayImg = '';
    if (props.overlayLayer) {
        overlayImg = (
            <OverlayLayer
                src={process.env.PUBLIC_URL +`/resized/overlay/${props.overlayLayer.fileName}`}
                top={props.overlayLayer.top}
                left={props.overlayLayer.left}
            />
        );
    }

    return (
        <div style={{position: 'absolute'}}>
            <ResizeableImageMapper {...props}>
                {overlayImg}
            </ResizeableImageMapper>
        </div>
    );
}

export default OverlayedCollage;