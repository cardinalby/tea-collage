import React, {useLayoutEffect, useState} from "react";
import OverlayLayer from "./OverlayLayer";
import ImageMapper, {
    ImageMapperBehaviorProps, ImageMapperMap,
    ImageMapperProps,
    ImageMapperStyleProps
} from "./ImageMapper";
import {CollageSources} from "../models/collageSourcesSet";

interface Size {
    width: number,
    height: number
}

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

function useElementSize(element: HTMLElement): Size {
    const [size, setSize] = useState<Size>({
        width: element.clientWidth,
        height: element.clientHeight
    });
    useLayoutEffect(() => {
        function updateSize() {
            setSize({
                width: element.clientWidth,
                height: element.clientHeight
            });
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, [element]);
    return size;
}

function calculateImgSize(containerSize: Size, imgSize: Size): Size {
    const imgProportions = imgSize.width / imgSize.height;
    const parentProportions = containerSize.width / containerSize.height;
    return imgProportions < parentProportions
        ?   {
                width: Math.round(containerSize.height * imgProportions),
                height: containerSize.height
            }
        :   {
                width: containerSize.width,
                height: Math.round(containerSize.width / imgProportions)
            };
}

function OverlayedImageMapper(props: OverlayedImageMapperProps)
{
    const containerSize = useElementSize(props.fitToElement);
    const size = calculateImgSize(
        containerSize,
        {
            width: props.collageSources.full.background.width,
            height: props.collageSources.full.background.height
        });
    const scale = size.width / props.collageSources.full.background.width;

    let overlay: JSX.Element|undefined = undefined;
    if (props.overlayLayerId !== undefined) {
        const overlayLayerId = props.overlayLayerId;
        overlay = (
            <OverlayLayer
                src={props.collageSources.getOverlayUrl(overlayLayerId)}
                previewSrc={props.collageSources.getOverlayUrl(overlayLayerId, true)}
                dimensions={props.collageSources.getOverlayDimensions(overlayLayerId).scale(scale)}
                onFilledAreaLeave={() => props.onOverlayLeave && props.onOverlayLeave(overlayLayerId)}
                onFilledAreaClick={() => props.onOverlayClick && props.onOverlayClick(overlayLayerId)}
                loadEvents={props.loadEvents}
            />
        );
    }

    const imgMapperProps = {
        ...getImageMapperProps(props),
        ...size,
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