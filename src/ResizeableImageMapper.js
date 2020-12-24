import React, {useLayoutEffect, useState} from "react";
import GroupImageMapper from "./GroupImageMapper";
import OverlayLayer from "./OverlayLayer";

function useElementSize(element) {
    const [size, setSize] = useState([element.clientWidth, element.clientHeight]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([element.clientWidth, element.clientHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, [element]);
    return size;
}

function calculateImgSize(parentWidth, parentHeight, imgWidth, imgHeight) {
    const imgProportions = imgWidth / imgHeight;
    const parentProportions = parentWidth / parentHeight;
    return imgProportions < parentProportions
        ? { width: Math.round(parentHeight * imgProportions), height: parentHeight }
        : { width: parentWidth, height: Math.round(parentWidth / imgProportions) };
}

function ResizeableImageMapper(props) {
    const [parentWidth, parentHeight] = useElementSize(props.fitToElement);
    const size = calculateImgSize(parentWidth, parentHeight, props.imgWidth, props.imgHeight);
    const scale = size.width / props.imgWidth;

    let overlayLayer = '';
    if (props.overlayLayerInfo) {
        const imgUrl = process.env.PUBLIC_URL +`/resized/overlay/${props.overlayLayerInfo.fileName}`
        overlayLayer = (
            <OverlayLayer
                src={imgUrl}
                top={props.overlayLayerInfo.top}
                left={props.overlayLayerInfo.left}
                width={size.width}
                height={size.height}
                scale={scale}
                onFilledAreaLeave={() => props.onOverlayLeave && props.onOverlayLeave()}
                onFilledAreaClick={() => props.onOverlayClick && props.onOverlayClick()}
            />
        );
    }

    return (
        <div style={{position: 'absolute'}}>
            <GroupImageMapper
                {...props}
                {...size}
            />
            {overlayLayer}
        </div>
    );
}

export default ResizeableImageMapper;