import React, {useLayoutEffect, useState} from "react";
import OverlayLayer from "./OverlayLayer";
import ImageMapper from "./ImageMapper";

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

/**
 * @param {CollageSources} props.collageSources
 */
function ResizeableImageMapper(props) {
    const [parentWidth, parentHeight] = useElementSize(props.fitToElement);
    const size = calculateImgSize(parentWidth, parentHeight, props.imgWidth, props.imgHeight);
    const scale = size.width / props.imgWidth;

    let overlay = '';
    if (props.overlayLayerId) {
        const imgUrl = props.collageSources.getOverlayUrl(props.overlayLayerId);
        const overlayLayer = props.collageSources.getOverlayItem(props.overlayLayerId);
        overlay = (
            <OverlayLayer
                src={imgUrl}
                top={overlayLayer.top}
                left={overlayLayer.left}
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
            <ImageMapper
                {...props}
                {...size}
            />
            {overlay}
        </div>
    );
}

export default ResizeableImageMapper;