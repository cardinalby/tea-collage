import React from 'react';
import {ImagePro} from "./ImagePro";

/** @param {OverlayDimensions} props.dimensions */
function OverlayLayer(props) {
    let ctx = null;
    const onImageLoad = (target, preview, component) => {
        const canvas = document.createElement('canvas');
        canvas.width = target.width;
        canvas.height = target.height;
        ctx = canvas.getContext('2d');
        ctx.drawImage(target, 0, 0, target.width, target.height);
        props.onLoad(target, preview, component);
    };

    const isTransparentPoint = event => {
        if (ctx) {
            const rect = event.target.getBoundingClientRect();
            const x = (event.clientX - rect.left) / props.scale;
            const y = (event.clientY - rect.top) / props.scale;
            return ctx.getImageData(x, y, 1, 1).data[3] === 0;
        }
        return false;
    }

    const onMouseMove = event => {
        if (props.onFilledAreaLeave && isTransparentPoint(event)) {
            props.onFilledAreaLeave();
        }
    };
    const onMouseLeave = () => {
        props.onFilledAreaLeave && props.onFilledAreaLeave();
    }
    const onMouseClick = event => {
        if (props.onFilledAreaLeave || props.onFilledAreaClick) {
            if (isTransparentPoint(event)) {
                props.onFilledAreaLeave && props.onFilledAreaLeave();
            } else {
                props.onFilledAreaClick && props.onFilledAreaClick();
            }
        }
    }

    return (
        <div
            className={'collage-overlay-container'}
            style={{
                left: 0,
                top: 0,
            }}
        >
            <div style={{position: 'absolute', width: '100%', height: '100%'}}>
                <ImagePro
                    src={props.src}
                    previewSrc={props.previewSrc}
                    className={'collage-overlay-img'}
                    style={{
                        left: props.dimensions.left,
                        top: props.dimensions.top,
                        width: props.dimensions.width,
                        height: props.dimensions.height,
                    }}
                    alt={'overlay'}
                    onMouseMove={onMouseMove}
                    onMouseLeave={onMouseLeave}
                    onClick={onMouseClick}
                    onLoad={onImageLoad}
                    onLoading={props.onLoading}
                    onError={props.onError}
                />
            </div>
        </div>
    );
}

export default OverlayLayer;
