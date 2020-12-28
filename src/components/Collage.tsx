import React, {useState} from "react";
import OverlayedImageMapper from "./OverlayedImageMapper";
import collageSourcesSet from "../models/collageSourcesSet";
import imgLoadingEvents from "../hooks/imgLoadingEvents";
import TeapotSpinner from "./TeapotSpinner";
import {ImageMapperArea} from "./ImageMapper";

export interface CollageProps {

}

function Collage(props) {
    const [containerRef, setContainerRef] = useState<HTMLDivElement|null>(null);
    const [overlayLayerId, setOverlayLayerId] = useState<string|undefined>();
    const [collageSources, setCollageSources] = useState(collageSourcesSet.getSources('medium'));
    if (!collageSources) {
        throw new Error('No sources');
    }

    const onAreaClick = (area: ImageMapperArea) => {
        area.group && setOverlayLayerId(area.group);
    }
    const onOverlayLeave = () => setOverlayLayerId(undefined);
    const onOverlayClick = (overlayLayerId: string) => {};

    const changeSize = () => {
        setCollageSources(collageSourcesSet.getSources('large'));
    }

    const imagesLoadingHandler = imgLoadingEvents();

    const teapotSpinner: JSX.Element|undefined = imagesLoadingHandler.isLoading
        ? <TeapotSpinner preview={imagesLoadingHandler.isPreview} />
        : undefined;

    const imageMapper = containerRef
        ? <OverlayedImageMapper
            collageSources={collageSources}
            areasMap={collageSourcesSet.getAreasMap()}
            overlayLayerId={overlayLayerId}
            fitToElement={containerRef}
            strokeColor="white"
            lineWidth={3}
            fillColor="rgba(0, 0, 0, 0.3)"
            onClick={onAreaClick}
            onOverlayLeave={onOverlayLeave}
            onOverlayClick={onOverlayClick}
            loadEvents={imagesLoadingHandler.eventHandlers}
        >
            {teapotSpinner}
        </OverlayedImageMapper>
        : '';

    return (
        <div className="collage-container" ref={node => setContainerRef(node)}>
            <div style={{'width': 50, 'height': 40, backgroundColor: 'red'}}
                 onClick={changeSize}
            />
            {imageMapper}
        </div>
    );
}

export default Collage;