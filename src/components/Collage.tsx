import React, {useState} from "react";
import OverlayedImageMapper from "./OverlayedImageMapper";
import collageSourcesSet from "../models/collageSourcesSet";
import imgLoadingEvents from "../hooks/useImgLoadingEvents";
import TeapotSpinner from "./TeapotSpinner";
import {ImageMapperArea} from "./ImageMapper";
import {useOverlayImagesPreloader} from "../hooks/useOverlayImagesPreloader";
import {useMouseHoverArea} from "../hooks/useMouseHoverArea";

export interface CollageProps {
    layerId?: string
}

function Collage(props: CollageProps) {
    const [containerRef, setContainerRef] = useState<HTMLDivElement|null>(null);
    const [overlayLayerId, setOverlayLayerId] = useState<string|undefined>(props.layerId);
    const [collageSources, setCollageSources] = useState(collageSourcesSet.getSources('medium'));

    const mouseHoverArea = useMouseHoverArea(1000, 1500);
    useOverlayImagesPreloader(collageSources, true, mouseHoverArea.preloadGroup || false);

    function onAreaClick(area: ImageMapperArea) {
        return area.group && setOverlayLayerId(area.group);
    }
    function onOverlayLeave() {
        setOverlayLayerId(undefined);
    }
    function onOverlayClick(overlayLayerId: string) {
        setCollageSources(collageSourcesSet.getSources('large'))
    }

    const imagesLoadingHandler = imgLoadingEvents();

    const imageMapper = containerRef
        ? <OverlayedImageMapper
            collageSources={collageSources}
            areasMap={collageSourcesSet.getAreasMap()}
            overlayLayerId={overlayLayerId}
            fitToElement={containerRef}
            lineWidth={3}
            onClick={onAreaClick}
            onOverlayLeave={onOverlayLeave}
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
        <div className="collage-container" ref={node => setContainerRef(node)}>
            {imageMapper}
        </div>
    );
}

export default Collage;