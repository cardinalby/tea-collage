import '../css/collage.css';
import React, {MouseEvent, useState} from "react";
import OverlayedImageMapper from "./OverlayedImageMapper";
import collageSourcesSet from "../models/collageSourcesSet";
import imgLoadingEvents from "../hooks/useImgLoadingEvents";
import {ImageMapperArea} from "./ImageMapper";
import {useOverlayImagesPreloader} from "../hooks/useOverlayImagesPreloader";
import {useMouseHoverArea} from "../hooks/useMouseHoverArea";
import { useHistory } from "react-router-dom";
import {useStateSafe} from "../hooks/useStateSafe";
import {CollageSources} from "../models/collageSources";
import {useDocumentKeyDown} from "../hooks/useDocumentKeyDown";
import {useTranslation} from "react-i18next";
import {useDocumentTitle} from "../hooks/useDocumentTitle";

export interface CollageProps {
    collageSources: CollageSources
    active: boolean
}

function Collage(props: CollageProps) {
    const {t} = useTranslation();
    useDocumentTitle(t('document_title.collage'));
    const imagesLoadingHandler = imgLoadingEvents();
    const [containerRef, setContainerRef] = useStateSafe<HTMLDivElement|null>(null);
    const [layerId, setLayerId] = useState<string|undefined>();

    const history = useHistory();
    const mouseHoverArea = useMouseHoverArea(1000, 1500);
    useOverlayImagesPreloader(
        props.collageSources,
        props.active,
        mouseHoverArea.preloadGroup || false
    );

    useDocumentKeyDown(event => {
        if (event.code === 'Escape') {
            closeOverlay();
        }
    });

    function closeOverlay() {
        if (layerId) {
            setLayerId(undefined);
            imagesLoadingHandler.eventHandlers.onHidden(layerId);
        }
    }

    function onContainerClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            closeOverlay();
        }
    }

    function onAreaClick(area: ImageMapperArea) {
        if (area.group) {
            setLayerId(area.group);
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
            overlayLayerId={layerId}
            fitToElement={containerRef}
            lineWidth={3}
            onClick={onAreaClick}
            onOverlayClick={onOverlayClick}
            onMouseEnter={mouseHoverArea.onMouseEnterArea}
            onMouseLeave={mouseHoverArea.onMouseLeaveArea}
            loadEvents={imagesLoadingHandler.eventHandlers}
            showLoader={imagesLoadingHandler.isLoading}
        />

    return (
        <div className="collage-container"
             ref={setContainerRef}
             onClick={onContainerClick}
             style={props.active ? {} : {display: 'none'}}
        >
            {imageMapper}
        </div>
    );
}

export default Collage;