import React, {useState} from 'react';

function isTransparentPoint(ctx, x, y) {
    return ctx.getImageData(x, y, 1, 1).data[3] === 0;
}

function OverlayLayer(props) {
    const img = new Image();
    img.src = props.src;
    img.onload = () => {
        if (!canvas) {
            return;
        }
        const width = img.width;
        const height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(
            img,
            props.left * props.resizeRatio,
            props.top * props.resizeRatio,
            width * props.resizeRatio,
            height * props.resizeRatio
        );
    };

    const [canvas, setCanvas] = useState(null);

    const onMouseMove = event => {
        console.log(isTransparentPoint(canvas.getContext('2d'), event.clientX, event.clientY));
    };

    return (
        <div
            className={'collage-overlay'}
            style={{
                left: 0,
                top: 0,
            }}
        >
            <canvas
                style={{
                    width: props.width + 'px',
                    height: props.height + 'px',
                }}
                width={props.width}
                height={props.height}
                ref={node => setCanvas(node)}
                onMouseMove={onMouseMove}
            />
        </div>
    );
}

export default OverlayLayer;
