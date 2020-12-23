import React, {useState} from "react";
import GroupImageMapper from "./GroupImageMapper";
import ResizeableImageMapper from "./ResizeableImageMapper";
const collageInfo = require("./collage-info.json");

function OldCollageImageMapper(props) {
    const [containerRef, setContainerRef] = useState(null);
    const [overlayLayerInfo, setOverlayLayerInfo] = useState(null);

    const imageMapper = containerRef
        ? <ResizeableImageMapper
            overlayLayerInfo={overlayLayerInfo}
            component={GroupImageMapper}
            src={process.env.PUBLIC_URL + '/resized/background.png'}
            fitToElement={containerRef}
            imgWidth={collageInfo.width}
            imgHeight={collageInfo.height}
            strokeColor="white"
            lineWidth={3}
            fillColor="rgba(0, 0, 0, 0.3)"
            map={collageInfo.imgAreasMap}
            onClick={area => setOverlayLayerInfo(collageInfo.overlayItems[area.group])}
        />
        : '';

    return (
        <div className="collage-container" ref={node => setContainerRef(node)}>
            {imageMapper}
        </div>
    );
}

export default OldCollageImageMapper;