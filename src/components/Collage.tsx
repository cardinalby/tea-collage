import React, {useState} from "react";
import OverlayedImageMapper from "./OverlayedImageMapper";
import collageSourcesSet from "../models/collageSourcesSet";
import imgLoadingEvents from "../hooks/useImgLoadingEvents";
import TeapotSpinner from "./TeapotSpinner";
import {ImageMapperArea} from "./ImageMapper";
import {useOverlayImagesPreloader} from "../hooks/useOverlayImagesPreloader";
import {useMouseHoverArea} from "../hooks/useMouseHoverArea";
import { useHistory } from "react-router-dom";
import {useIsMounted} from "../hooks/useIsMounted";

export interface CollageProps {
    layerId?: string
}

function Collage(props: CollageProps) {
    const isMounted = useIsMounted();
    const imagesLoadingHandler = imgLoadingEvents();
    const [containerRef, setContainerRef] = useState<HTMLDivElement|null>(null);
    const [collageSources, setCollageSources] = useState(collageSourcesSet.getSources('medium'));

    const history = useHistory();
    const mouseHoverArea = useMouseHoverArea(1000, 1500);
    useOverlayImagesPreloader(collageSources, true, mouseHoverArea.preloadGroup || false);

    function onAreaClick(area: ImageMapperArea) {
        if (area.group) {
            history.replace(`/collage/${area.group}`);
        }
    }

    function onOverlayClick(event, layerId: string, isTransparentArea: boolean) {
        if (isTransparentArea) {
            history.replace('/collage/');
        } else {
            setCollageSources(collageSourcesSet.getSources('large'))
        }
    }

    const imageMapper = containerRef
        ? <OverlayedImageMapper
            collageSources={collageSources}
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
        <div className="collage-container" ref={node => isMounted && setContainerRef(node)}>
            {imageMapper}
        </div>
    );
}

export default Collage;