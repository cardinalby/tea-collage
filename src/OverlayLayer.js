import React from 'react';

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

    return (
        <div
            className={'collage-overlay'}
            style={{
                left: 0,
                top: 0,
            }}
        >
            <img
                style={{
                    left: props.left * props.scale,
                    top: props.top * props.scale,
                    transform: `scale(${props.scale})`
                }}
                src={props.src}
                alt={'overlay'}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                onClick={onMouseClick}
                onLoad={onImageLoad}
            />
        </div>
    );
}

export default OverlayLayer;
