import React, {useRef, useState} from 'react';
import {OverlayDimensions} from "../models/collageSourcesSet";
import {SmoothImageLoadEvents, SmoothImageLoadEventsWrapper, SmoothImage} from "./SmoothImage";

interface OverlayLayerProps {
    src: string,
    previewSrc: string,
    dimensions: OverlayDimensions
    loadEvents: SmoothImageLoadEvents,
    onFilledAreaLeave: (event) => void,
    onFilledAreaClick: (event) => void
}

function OverlayLayer(props: OverlayLayerProps)
{
    const loadEvents = new SmoothImageLoadEventsWrapper(props.loadEvents)
    const [ctx, setCtx] = useState<CanvasRenderingContext2D|undefined>();
    const actualImg = useRef<{element: HTMLImageElement, preview: boolean}>();

    const onImageLoad = (target, preview, component) => {
        if (!actualImg.current || actualImg.current.preview === preview || !preview) {
            actualImg.current = { element: target, preview };
        }
        const canvas = document.createElement('canvas');
        canvas.width = target.naturalWidth;
        canvas.height = target.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error("Can't get 2d context");
        }
        ctx.drawImage(target, 0, 0, canvas.width, canvas.height);
        setCtx(ctx);
        loadEvents.onLoad(target, preview, component);
    };

    const isTransparentPoint = event => {
        if (ctx) {
            const rect = event.target.getBoundingClientRect();
            const x = (event.clientX - rect.left) * event.target.naturalWidth / event.target.clientWidth;
            const y = (event.clientY - rect.top) * event.target.naturalHeight / event.target.clientHeight;
            return ctx.getImageData(x, y, 1, 1).data[3] === 0;

        }
        return false;
    }

    const onMouseMove = event  => {
        if (props.onFilledAreaLeave && isTransparentPoint(event)) {
            props.onFilledAreaLeave(event);
        }
    };
    const onMouseLeave = (event) => {
        if (props.onFilledAreaLeave &&
            actualImg.current &&
            event.target === actualImg.current.element
        ) {
            props.onFilledAreaLeave(event);
        }
    }
    const onMouseClick = (event) => {
        if (props.onFilledAreaLeave || props.onFilledAreaClick) {
            if (isTransparentPoint(event)) {
                props.onFilledAreaLeave && props.onFilledAreaLeave(event);
            } else {
                props.onFilledAreaClick && props.onFilledAreaClick(event);
            }
        }
    }

    return (
        <div className={'collage-overlay-container'}>
            <div style={{position: 'absolute', width: '100%', height: '100%'}}>
                <SmoothImage
                    src={props.src}
                    previewSrc={props.previewSrc}
                    loadEvents={{
                        ...loadEvents,
                        onLoad: onImageLoad
                    }}
                    imgProps={{
                        //className: 'collage-overlay-img',
                        style: {
                            left: props.dimensions.left,
                            top: props.dimensions.top,
                            width: props.dimensions.width,
                            height: props.dimensions.height,
                        },
                        alt: 'overlay',
                        onMouseMove,
                        onMouseLeave,
                        onClick: onMouseClick
                    }}
                />
            </div>
        </div>
    );
}

export default OverlayLayer;
