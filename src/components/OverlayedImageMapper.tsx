import '../css/spinner.css';
import React, {MouseEvent, useRef, useState} from "react";
import OverlayLayer from "./OverlayLayer";
import ImageMapper, {
    ImageMapperBehaviorProps, ImageMapperMap,
    ImageMapperProps,
    ImageMapperStyleProps
} from "./ImageMapper";
import {useFittedScale} from "../hooks/useFittedScale";
import {classNames} from "../models/reactUtils";
import {withTranslation} from "react-i18next";
import {CollageSources} from "../models/collageSources";
import TeapotSpinner from "./TeapotSpinner";

const ImageMapperTranslated = withTranslation()(ImageMapper);

interface OverlayedImageMapperProps extends
    ImageMapperStyleProps,
    ImageMapperBehaviorProps
{
    showLoader: boolean,
    collageSources: CollageSources,
    areasMap: ImageMapperMap,
    fitToElement: HTMLElement,
    overlayLayerId?: string,
    onOverlayClick?: (event: MouseEvent, layerId: string, isTransparentArea: boolean) => void,
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
    } else if (!props.overlayLayerId && overlayHoverOnTransparent) {
        setOverlayHoverOnTransparent(false);
    }

    function onOverlayClick(event: MouseEvent, isTransparentArea: boolean) {
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
            containerClass='collage-overlay-container'
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
        width: Math.round(props.collageSources.full.background.width * scale),
        height: Math.round(props.collageSources.full.background.height * scale),
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
            <ImageMapperTranslated {...imgMapperProps} />
            {overlay}
            <TeapotSpinner active={props.showLoader} scale={scale} collageSources={props.collageSources}/>
            {props.children}
        </div>
    );
}

export default OverlayedImageMapper;