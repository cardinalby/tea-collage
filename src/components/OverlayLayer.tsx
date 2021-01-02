import React, {MouseEvent, useRef, useState} from 'react';
import {OverlayDimensions} from "../models/collageSourcesSet";
import {SmoothImageLoadEvents, SmoothImageLoadEventsWrapper, SmoothImage} from "./SmoothImage";
import {isTransparentCanvasPoint} from "../models/canvasUtils";
import {getDistanceBetweenPoints, Point2d} from "../models/point2d";

type DivMouseEvent = MouseEvent<HTMLDivElement>;
type ImgMouseEvent = MouseEvent<HTMLImageElement>;
type LayerMouseEvent = MouseEvent<HTMLImageElement|HTMLDivElement>;

interface OverlayLayerProps {
    layerId?: string,
    src: string,
    previewSrc: string,
    dimensions: OverlayDimensions
    loadEvents: SmoothImageLoadEvents,
    exitDistance?: number,
    fadeOutDistance?: number,
    onFilledAreaLeaving?: (event: LayerMouseEvent, opacity: number, exitLevel: number, layerId?: string) => void
    onFilledAreaLeave?: (event: DivMouseEvent, layerId?: string) => void,
    onFilledAreaClick?: (event: DivMouseEvent, layerId?: string) => void
}

function OverlayLayer(props: OverlayLayerProps)
{
    const loadEvents = new SmoothImageLoadEventsWrapper(props.loadEvents)
    const [ctx, setCtx] = useState<CanvasRenderingContext2D|undefined>();
    const actualImg = useRef<{element: HTMLImageElement, preview: boolean}>();
    const [layerOpacity, setLayerOpacity] = useState(100);
    const exitPoint = useRef<Point2d|undefined>();

    const onImageLoad = (target: HTMLImageElement, preview: boolean, component) => {
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

    function getCanvasCoordsByImgMouseEvent(event: ImgMouseEvent): Point2d {
        const target = event.target as HTMLImageElement;
        const rect = target.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * target.naturalWidth / target.clientWidth,
            y: (event.clientY - rect.top) * target.naturalHeight / target.clientHeight
        };
    }

    function isTransparentPoint(event: LayerMouseEvent): boolean {
        if (event.target instanceof HTMLDivElement) {
            return true;
        }
        if (ctx && event.target instanceof HTMLImageElement) {
            const canvasPoint = getCanvasCoordsByImgMouseEvent(event as ImgMouseEvent);
            return isTransparentCanvasPoint(ctx, canvasPoint);
        }
        return false;
    }

    function onMouseMove(event: LayerMouseEvent): void {
        if (isTransparentPoint(event)) {
            if (!exitPoint.current) {
                exitPoint.current = {x: event.clientX, y: event.clientY};
            }
        } else {
            exitPoint.current = undefined;
        }

        const eventPoint = {x: event.clientX, y: event.clientY};
        if (exitPoint.current) {
            let distance: number|undefined = undefined;
            if (props.fadeOutDistance || props.exitDistance) {
                distance = getDistanceBetweenPoints(exitPoint.current, eventPoint);
            }
            let opacity = 100;
            if (props.fadeOutDistance && distance) {
                opacity = (1 - distance / props.fadeOutDistance) * 100;
            }
            if (layerOpacity !== opacity) {
                setLayerOpacity(opacity);
            }
            props.onFilledAreaLeaving && props.onFilledAreaLeaving(
                event,
                opacity,
                distance && props.exitDistance
                    ? distance / props.exitDistance
                    : 100,
                    props.layerId
            );

            if (props.onFilledAreaLeave &&
                (
                    (distance && props.exitDistance && distance >= props.exitDistance) ||
                    !props.exitDistance
                )
            ) {
                props.onFilledAreaLeave(event, props.layerId);
            }
        } else if (layerOpacity !== 100) {
            setLayerOpacity(100);
        }
    }

    function onMouseClick(event: DivMouseEvent): void {
        if (props.onFilledAreaLeave || props.onFilledAreaClick) {
            if (isTransparentPoint(event)) {
                props.onFilledAreaLeave && props.onFilledAreaLeave(event, props.layerId);
            } else {
                props.onFilledAreaClick && props.onFilledAreaClick(event, props.layerId);
            }
        }
    }

    return (
        <div className={'collage-overlay-container'}>
            <div
                style={{position: 'absolute', width: '100%', height: '100%', opacity: layerOpacity + '%'}}
                onMouseMove={onMouseMove}
                onClick={onMouseClick}
            >
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
                        onClick: onMouseClick
                    }}
                />
            </div>
        </div>
    );
}

export default OverlayLayer;
