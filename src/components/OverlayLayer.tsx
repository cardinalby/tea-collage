import React, {MouseEvent, useRef, useState} from 'react';
import {OverlayDimensions} from "../models/collageSourcesSet";
import {SmoothImageLoadEvents, SmoothImageLoadEventsWrapper, SmoothImage} from "./SmoothImage";
import {getCanvasPointAlpha} from "../models/canvasUtils";
import {Point2d} from "../models/point2d";

type DivMouseEvent = MouseEvent<HTMLDivElement>;
type ImgMouseEvent = MouseEvent<HTMLImageElement>;
type LayerMouseEvent = DivMouseEvent|ImgMouseEvent;

interface OverlayLayerProps {
    layerId?: string,
    src: string,
    previewSrc: string,
    dimensions: OverlayDimensions
    loadEvents: SmoothImageLoadEvents,
    onClick?: (event: LayerMouseEvent, isTransparentArea: boolean) => void
    onMouseHover?: (event: LayerMouseEvent, isTransparentArea: boolean) => void
    onMouseLeave?: (event: LayerMouseEvent) => void
}

function OverlayLayer(props: OverlayLayerProps)
{
    const loadEvents = new SmoothImageLoadEventsWrapper(props.loadEvents)
    const [ctx, setCtx] = useState<CanvasRenderingContext2D|undefined>();
    const actualImg = useRef<{element: HTMLImageElement, preview: boolean}>();
    const isTransparentMouseHoverPoint = useRef<boolean>();

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
            return getCanvasPointAlpha(ctx, canvasPoint) < 5;
        }
        return false;
    }

    function onMouseMove(event: LayerMouseEvent): void {
        if (props.onMouseHover) {
            const isTransparent = isTransparentPoint(event);
            if (isTransparent !== isTransparentMouseHoverPoint.current) {
                props.onMouseHover(event, isTransparent);
                isTransparentMouseHoverPoint.current = isTransparent;
            }
        }
    }

    function onMouseLeave(event: DivMouseEvent) {
        if (props.onMouseLeave) {
            props.onMouseLeave(event);
        }
        isTransparentMouseHoverPoint.current = undefined;
    }

    function onMouseClick(event: LayerMouseEvent): void {
        if (props.onClick) {
            props.onClick(event ,isTransparentPoint(event));
        }
    }

    return (
        <div className={'collage-overlay-container'}>
            <div
                style={{position: 'absolute', width: '100%', height: '100%'}}
                onMouseMove={onMouseMove}
                onClick={onMouseClick}
                onMouseLeave={onMouseLeave}
                onMouseEnter={onMouseMove}
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
