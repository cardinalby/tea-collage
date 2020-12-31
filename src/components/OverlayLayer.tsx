import React, {MouseEvent, useRef, useState} from 'react';
import {OverlayDimensions} from "../models/collageSourcesSet";
import {SmoothImageLoadEvents, SmoothImageLoadEventsWrapper, SmoothImage} from "./SmoothImage";
import {isTransparentCanvasPoint} from "../models/canvasUtils";
import {getDistanceBetweenPoints, Point2d} from "../models/point2d";

type ImgMouseEvent = MouseEvent<HTMLImageElement>;

interface OverlayLayerProps {
    layerId?: string,
    src: string,
    previewSrc: string,
    dimensions: OverlayDimensions
    loadEvents: SmoothImageLoadEvents,
    onFilledAreaLeave: (event: ImgMouseEvent, layerId?: string) => void,
    onFilledAreaClick: (event: ImgMouseEvent, layerId?: string) => void
}

function getCanvasCoordsByImgMouseEvent(event: ImgMouseEvent): Point2d {
    const target = event.target as HTMLImageElement;
    const rect = target.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * target.naturalWidth / target.clientWidth,
        y: (event.clientY - rect.top) * target.naturalHeight / target.clientHeight
    };
}

function OverlayLayer(props: OverlayLayerProps)
{
    const loadEvents = new SmoothImageLoadEventsWrapper(props.loadEvents)
    const [ctx, setCtx] = useState<CanvasRenderingContext2D|undefined>();
    const actualImg = useRef<{element: HTMLImageElement, preview: boolean}>();
    const [layerOpacity, setLayerOpacity] = useState(100);
    const exitPoint = useRef<Point2d|undefined>();

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

    const isTransparentPoint = (event: ImgMouseEvent) => {
        if (ctx) {
            const canvasPoint = getCanvasCoordsByImgMouseEvent(event);
            return isTransparentCanvasPoint(ctx, canvasPoint);
        }
        return false;
    }

    const onMouseMove = (event: ImgMouseEvent)  => {
        if (isTransparentPoint(event)) {
            if (!exitPoint.current) {
                exitPoint.current = {x: event.clientX, y: event.clientY};
            }
        } else {
            exitPoint.current = undefined;
        }

        const eventPoint = {x: event.clientX, y: event.clientY};
        if (exitPoint.current) {
            const distance = getDistanceBetweenPoints(exitPoint.current, eventPoint);
            console.log(distance, (1 - distance / 100) * 100);
            setLayerOpacity((1 - distance / 100) * 100);

            if (props.onFilledAreaLeave && distance > 200) {
                props.onFilledAreaLeave(event);
            }
        } else if (layerOpacity !== 100) {
            setLayerOpacity(100);
        }
    };
    const onMouseLeave = (event: ImgMouseEvent) => {
        if (props.onFilledAreaLeave &&
            actualImg.current &&
            event.target === actualImg.current.element
        ) {
            props.onFilledAreaLeave(event);
        }
    }
    const onMouseClick = (event: ImgMouseEvent) => {
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
            <div style={{position: 'absolute', width: '100%', height: '100%', opacity: layerOpacity + '%'}}>
                <SmoothImage
                    componentId={props.layerId}
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
