import React from "react";
import OverlayLayer from "./OverlayLayer";
import ImageMapper, {
    ImageMapperBehaviorProps, ImageMapperMap,
    ImageMapperProps,
    ImageMapperStyleProps
} from "./ImageMapper";
import {CollageSources} from "../models/collageSourcesSet";
import {useFittedScale} from "../hooks/useFittedScale";

interface OverlayedImageMapperProps extends
    ImageMapperStyleProps,
    ImageMapperBehaviorProps
{
    collageSources: CollageSources,
    areasMap: ImageMapperMap,
    fitToElement: HTMLElement,
    overlayLayerId?: string,
    onOverlayLeave: (layerId: string) => void,
    onOverlayClick: (layerId: string) => void,
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

    let overlay: JSX.Element|undefined = undefined;
    if (props.overlayLayerId !== undefined) {
        const overlayLayerId = props.overlayLayerId;
        overlay = (
            <OverlayLayer
                layerId={props.overlayLayerId}
                src={props.collageSources.getOverlayUrl(overlayLayerId)}
                previewSrc={props.collageSources.getOverlayUrl(overlayLayerId, true)}
                dimensions={props.collageSources.getOverlayDimensions(overlayLayerId).scale(scale)}
                onFilledAreaLeave={() => props.onOverlayLeave && props.onOverlayLeave(overlayLayerId)}
                onFilledAreaClick={() => props.onOverlayClick && props.onOverlayClick(overlayLayerId)}
                exitDistance={60 * scale}
                fadeOutDistance={70 * scale}
                loadEvents={props.loadEvents}
            />
        );
    }

    const imgMapperProps = {
        ...getImageMapperProps(props),
        width: props.collageSources.full.background.width * scale,
        height: props.collageSources.full.background.height * scale,
        imgClassName: props.overlayLayerId ? 'collage-bg-inactive' : 'collage-bg-active'
    };

    return (
        <div style={{position: 'absolute'}}>
            <ImageMapper
                src={props.collageSources.getBackgroundUrl(false)}
                previewSrc={props.collageSources.getBackgroundUrl(true)}
                imgWidth={props.collageSources.full.background.width}
                map={props.areasMap}
                {...imgMapperProps}
            />
            {overlay}
            {props.children}
        </div>
    );
}

export default OverlayedImageMapper;