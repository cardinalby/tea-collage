import React, {useState} from "react";
import OverlayedImageMapper from "./OverlayedImageMapper";
import collageSourcesSet from "../models/collageSourcesSet";
import imgLoadingEvents from "../hooks/useImgLoadingEvents";
import TeapotSpinner from "./TeapotSpinner";
import {ImageMapperArea} from "./ImageMapper";
import {useOverlayImagesPreloader} from "../hooks/useOverlayImagesPreloader";
import {useParams} from 'react-router';

export interface CollageProps {

}

function Collage(props) {
    const [containerRef, setContainerRef] = useState<HTMLDivElement|null>(null);
    const [overlayLayerId, setOverlayLayerId] = useState<string|undefined>();
    const [collageSources, setCollageSources] = useState(collageSourcesSet.getSources('medium'));
    useOverlayImagesPreloader(collageSources, true, false);


    const onAreaClick = (area: ImageMapperArea) => {
        area.group && setOverlayLayerId(area.group);
    }
    const onOverlayLeave = () => setOverlayLayerId(undefined);
    const onOverlayClick = (overlayLayerId: string) => {
        setCollageSources(collageSourcesSet.getSources('large'))
    };

    const changeSize = () => {
        setCollageSources(collageSourcesSet.getSources('large'));
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
            <div style={{'width': 50, 'height': 40, backgroundColor: 'red'}}
                 onClick={changeSize}
            />
            {imageMapper}
        </div>
    );
}

export default Collage;