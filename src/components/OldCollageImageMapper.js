import React, {useState} from "react";
import ResizeableImageMapper from "./ResizeableImageMapper";
import collageSourcesSet from "../models/collageSourcesSet";

function OldCollageImageMapper(props) {
    const [containerRef, setContainerRef] = useState(null);
    const [overlayLayerId, setOverlayLayerId] = useState(null);
    const [collageSources, setCollageSources] = useState(collageSourcesSet.getSources('medium'));

    const onAreaClick = area => setOverlayLayerId(area.group);
    const onOverlayLeave = () => setOverlayLayerId(null);
    const onOverlayClick = (area) => {};

    const changeSize = () => {
        setCollageSources(collageSourcesSet.getSources('large'));
    }

    const imageMapper = containerRef
        ? <ResizeableImageMapper
            collageSources={collageSources}
            overlayLayerId={overlayLayerId}
            src={collageSources.getBackgroundUrl(false)}
            previewSrc={collageSources.getBackgroundUrl(true)}
            fitToElement={containerRef}
            imgWidth={collageSources.full.background.width}
            imgHeight={collageSources.full.background.height}
            strokeColor="white"
            lineWidth={3}
            fillColor="rgba(0, 0, 0, 0.3)"
            map={collageSources.full.imgAreasMap}
            onClick={onAreaClick}
            onOverlayLeave={onOverlayLeave}
            onOverlayClick={onOverlayClick}
        />
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

export default OldCollageImageMapper;