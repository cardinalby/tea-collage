import '../css/collage.css';
import React from "react";
import OverlayedImageMapper from "./OverlayedImageMapper";
import collageSourcesSet, {CollageSources} from "../models/collageSourcesSet";
import imgLoadingEvents from "../hooks/useImgLoadingEvents";
import TeapotSpinner from "./TeapotSpinner";
import {ImageMapperArea} from "./ImageMapper";
import {useOverlayImagesPreloader} from "../hooks/useOverlayImagesPreloader";
import {useMouseHoverArea} from "../hooks/useMouseHoverArea";
import { useHistory } from "react-router-dom";
import {useStateSafe} from "../hooks/useStateSafe";

export interface CollageProps {
    layerId?: string
    collageSources: CollageSources
}

function Collage(props: CollageProps) {
    const imagesLoadingHandler = imgLoadingEvents();
    const [containerRef, setContainerRef] = useStateSafe<HTMLDivElement|null>(null);

    const history = useHistory();
    const mouseHoverArea = useMouseHoverArea(1000, 1500);
    useOverlayImagesPreloader(props.collageSources, true, mouseHoverArea.preloadGroup || false);

    function onAreaClick(area: ImageMapperArea) {
        if (area.group) {
            history.replace(`/collage/${area.group}`);
        }
    }

    function onOverlayClick(event, layerId: string, isTransparentArea: boolean) {
        if (isTransparentArea) {
            history.replace('/collage/');
        } else {
            console.log(layerId);
        }
    }

    const imageMapper = containerRef
        ? <OverlayedImageMapper
            collageSources={props.collageSources}
            areasMap={collageSourcesSet.getAreasMap()}
            overlayLayerId={props.layerId}
            fitToElement={containerRef}
            lineWidth={3}
            onClick={onAreaClick}
            onOverlayClick={onOverlayClick}
            onMouseEnter={mouseHoverArea.onMouseEnterArea}
            onMouseLeave={mouseHoverArea.onMouseLeaveArea}
            loadEvents={imagesLoadingHandler.eventHandlers}
        >
            <TeapotSpinner
                active={imagesLoadingHandler.isLoading}
                preview={imagesLoadingHandler.isPreview}
            />
        </OverlayedImageMapper>
        : '';

    return (
        <div className="collage-container" ref={setContainerRef}>
            {imageMapper}
        </div>
    );
}

export default Collage;