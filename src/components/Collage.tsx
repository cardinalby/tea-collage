import '../css/collage.css';
import React, {MouseEvent} from "react";
import OverlayedImageMapper from "./OverlayedImageMapper";
import collageSourcesSet from "../models/collageSourcesSet";
import imgLoadingEvents from "../hooks/useImgLoadingEvents";
import TeapotSpinner from "./TeapotSpinner";
import {ImageMapperArea} from "./ImageMapper";
import {useOverlayImagesPreloader} from "../hooks/useOverlayImagesPreloader";
import {useMouseHoverArea} from "../hooks/useMouseHoverArea";
import { useHistory } from "react-router-dom";
import {useStateSafe} from "../hooks/useStateSafe";
import {CollageSources} from "../models/collageSources";

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

    function closeOverlay() {
        if (props.layerId) {
            history.replace('/collage/');
        }
    }

    function onContainerClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            closeOverlay();
        }
    }

    function onAreaClick(area: ImageMapperArea) {
        if (area.group) {
            history.replace(`/collage/${area.group}`);
        }
    }

    function onOverlayClick(event: MouseEvent, layerId: string, isTransparentArea: boolean) {
        if (isTransparentArea) {
            closeOverlay();
        } else {
            history.push(`/description/${layerId}`)
        }
    }

    const imageMapper = containerRef &&
        <OverlayedImageMapper
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
        </OverlayedImageMapper>;

    return (
        <div className="collage-container"
             ref={setContainerRef}
             onClick={onContainerClick}
        >
            {imageMapper}
        </div>
    );
}

export default Collage;