import React, {useEffect, useMemo, useRef, useState} from "react";
import {classNames} from "../models/reactUtils";

export type SmoothImageEvent = (target: HTMLImageElement, preview: boolean, component: any) => void;

export interface SmoothImageLoadEvents {
    onError?: SmoothImageEvent,
    onLoad?: SmoothImageEvent,
    onLoading?: SmoothImageEvent
}

export class SmoothImageLoadEventsWrapper implements SmoothImageLoadEvents {
    public constructor(
        public events?: SmoothImageLoadEvents,
    ) {
    }

    onError: SmoothImageEvent = (...args) =>
        this.events?.onError && this.events.onError(...args);

    onLoad: SmoothImageEvent = (...args) =>
        this.events?.onLoad && this.events.onLoad(...args);

    onLoading: SmoothImageEvent = (...args) =>
        this.events?.onLoading && this.events.onLoading(...args);
}

export interface SmoothImageProps {
    componentId?: string,
    imgRef?: (img: HTMLImageElement, preview: boolean) => void,
    src: string,
    previewSrc?: string,
    imgProps: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
    loadEvents?: SmoothImageLoadEvents
}

let idCounter = 1;

export function SmoothImage(props: SmoothImageProps) {
    const [fullLoaded, setFullLoaded] = useState(false);
    const [previewLoaded, setPreviewLoaded] = useState(false);
    const previewSrc = useRef<string|undefined>(undefined);
    const fullSrc = useRef<string|undefined>(undefined);
    const componentId = useState(props.componentId || Symbol('smooth_image_' + idCounter++))[0];

    const loadEvents = useMemo(() => new SmoothImageLoadEventsWrapper(props.loadEvents), [props.loadEvents]);
    const fullImg = useRef(undefined as HTMLImageElement|undefined);
    const previewImg = useRef(undefined as HTMLImageElement|undefined);

    if (previewSrc.current !== props.previewSrc) {
        previewSrc.current = props.previewSrc;
        if (previewImg.current) {
            previewImg.current = undefined;
        }
    }
    if (fullSrc.current !== props.src) {
        fullSrc.current = props.src;
        if (fullImg.current) {
            fullImg.current = undefined;
        }
    }

    const onImgRef = (node, preview) => {
        if (node === null) {
            return;
        }
        if (props.imgRef) {
            props.imgRef(node, preview)
        }
        const imgRef = (preview ? previewImg : fullImg);
        if (!imgRef.current) {
            loadEvents.onLoading(node, preview, componentId);
        }
        imgRef.current = node;
    }

    const willUnmount = useRef(false);
    useEffect(() => { return () => {
        willUnmount.current = true;
    }}, []);

    useEffect(() => { return () => {
        if (willUnmount.current) {
            if (!previewLoaded && previewImg.current) {
                loadEvents.onError(previewImg.current, true, componentId);
            }
            if (!fullLoaded && fullImg.current) {
                loadEvents.onError(fullImg.current, false, componentId);
            }
        }
    }}, [previewLoaded, fullLoaded, componentId, loadEvents]);

    const onImgLoad = (event, preview) => {
        loadEvents.onLoad(event.target as HTMLImageElement, preview, componentId);
        if (!willUnmount.current) {
            preview ? setPreviewLoaded(true) : setFullLoaded(true);
        }
    }

    const onImgError = (event, preview) => {
        loadEvents.onError(event.target as HTMLImageElement, preview, componentId);
    }

    const {style, className, ...otherImgProps} = (props.imgProps || {});
    const addClassName = (value: string|undefined|(string|undefined)[]): string =>
        classNames(props.imgProps && props.imgProps.className, value);

    return(
        <div>
            {props.previewSrc &&
                <img
                    src={props.previewSrc}
                    alt={props.imgProps.alt}
                    ref={node => onImgRef(node, true)}
                    onLoad={event => onImgLoad(event, true)}
                    onError={event => onImgError(event, true)}
                    className={addClassName([
                        'smooth-img',
                        'preview',
                        previewLoaded ? 'ready' : (previewImg.current ? 'loading' : 'init')
                    ])}
                    style={{
                        ...style,
                        position: 'absolute'
                    }}
                    {...otherImgProps}
                />
            }
            <img
                src={props.src}
                alt={props.imgProps.alt}
                ref={node => onImgRef(node, false)}
                onLoad={event => onImgLoad(event, false)}
                onError={event => onImgError(event, false)}
                {...props.imgProps}
                className={addClassName([
                    'smooth-img',
                    'full',
                    fullLoaded ? 'ready' : (fullImg.current ? 'loading' : 'init')
                ])}
                style={{
                    ...style,
                    position: 'absolute'
                }}
            />
        </div>
    );
}