import React, {useEffect, useRef, useState} from "react";
import OverlayLayer from "./OverlayLayer";
import ImageMapper, {
    ImageMapperBehaviorProps, ImageMapperMap,
    ImageMapperProps,
    ImageMapperStyleProps
} from "./ImageMapper";
import {CollageSources} from "../models/collageSourcesSet";
import {useFittedScale} from "../hooks/useFittedScale";
import {classNames} from "../models/reactUtils";

interface OverlayedImageMapperProps extends
    ImageMapperStyleProps,
    ImageMapperBehaviorProps
{
    collageSources: CollageSources,
    areasMap: ImageMapperMap,
    fitToElement: HTMLElement,
    overlayLayerId?: string,
    onOverlayClick?: (event, layerId: string, isTransparentArea: boolean) => void,
    children?: JSX.Element
}

const selfPropNames = new Set([
    'collageSources',
    'fitToElement',
    'imgHeight',
    'overlayLayerId',
    'onOverlayLeave',
    'onOverlayClick',
    'children?',
]);

function getImageMapperProps(
    props: OverlayedImageMapperProps
): ImageMapperStyleProps & ImageMapperBehaviorProps
{
    return Object.fromEntries(
        Object.keys(props)
            .filter(key => !selfPropNames.has(key))
            .map(key => [key, props[key]])
    ) as ImageMapperProps;
}

function OverlayedImageMapper(props: OverlayedImageMapperProps)
{
    const scale = useFittedScale(
        props.fitToElement,
        props.collageSources.full.background.width,
        props.collageSources.full.background.height
        );

    const prevOverlayLayer = useRef<string|undefined>(undefined);
    const [overlayHoverOnTransparent, setOverlayHoverOnTransparent] = useState<boolean|undefined>(false);
    if (prevOverlayLayer.current !== props.overlayLayerId) {
        prevOverlayLayer.current = props.overlayLayerId;
        setOverlayHoverOnTransparent(false);
    } else if (!props.overlayLayerId && overlayHoverOnTransparent) {
        setOverlayHoverOnTransparent(false);
    }

    function onOverlayClick(event, isTransparentArea: boolean) {
        if (props.overlayLayerId && props.onOverlayClick) {
            props.onOverlayClick(event, props.overlayLayerId, isTransparentArea);
        }
    }

    function onOverlayMouseHover(event, isTransparentArea: boolean) {
        if (overlayHoverOnTransparent !== isTransparentArea) {
            setOverlayHoverOnTransparent(isTransparentArea);
        }
    }

    function onOverlayMouseLeave() {
        setOverlayHoverOnTransparent(undefined);
    }

    const overlay = props.overlayLayerId !== undefined && (
        <OverlayLayer
            layerId={props.overlayLayerId}
            src={props.collageSources.getOverlayUrl(props.overlayLayerId)}
            previewSrc={props.collageSources.getOverlayUrl(props.overlayLayerId, true)}
            dimensions={props.collageSources.getOverlayDimensions(props.overlayLayerId).scale(scale)}
            onClick={onOverlayClick}
            onMouseHover={onOverlayMouseHover}
            onMouseLeave={onOverlayMouseLeave}
            loadEvents={props.loadEvents}
        />
    );

    const imgMapperProps = {
        ...getImageMapperProps(props),
        width: props.collageSources.full.background.width * scale,
        height: props.collageSources.full.background.height * scale,
        containerClassName: 'collage-bg',
        src: props.collageSources.getBackgroundUrl(false),
        previewSrc: props.collageSources.getBackgroundUrl(true),
        imgWidth: props.collageSources.full.background.width,
        map: props.areasMap
    };

    return (
        <div style={{position: 'relative'}}
             className={classNames(
                 props.overlayLayerId ? 'overlay-shown' : undefined,
                 props.overlayLayerId && overlayHoverOnTransparent === true && 'overlay-hover-on-transparent',
                 props.overlayLayerId && overlayHoverOnTransparent === false && 'overlay-hover-on-filled',
                 props.overlayLayerId && overlayHoverOnTransparent === undefined && 'overlay-no-hover',
             )}
        >
            <ImageMapper {...imgMapperProps} />
            {overlay}
            {props.children}
        </div>
    );
}

export default OverlayedImageMapper;