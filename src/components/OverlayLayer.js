import React from 'react';
import ProgressiveImage from 'react-progressive-image';
import Spinner from "./Spinner";

/** @param {OverlayDimensions} props.dimensions */
function OverlayLayer(props) {
    let ctx = null;
    const onImageLoad = (event) => {
        const img = event.target;
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
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

    const renderImg = (src, loading) =>
        <div style={{position: 'absolute', width: '100%', height: '100%'}}>
            <img
                className={'collage-overlay-img'}
                style={{
                    left: props.dimensions.left,
                    top: props.dimensions.top,
                    width: props.dimensions.width,
                    height: props.dimensions.height,
                }}
                src={src}
                alt={'overlay'}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                onClick={onMouseClick}
                onLoad={onImageLoad}
            />
            {loading ? <Spinner /> : ''}
        </div>

    return (
        <div
            className={'collage-overlay-container'}
            style={{
                left: 0,
                top: 0,
            }}
        >
            <ProgressiveImage src={props.src} placeholder={props.previewSrc}>
                {renderImg}
            </ProgressiveImage>
        </div>
    );
}

export default OverlayLayer;
