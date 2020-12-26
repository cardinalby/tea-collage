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
        const overlayDimensions =
            props.collageSources.getOverlayDimensions(props.overlayLayerId).scale(scale);
        overlay = (
            <OverlayLayer
                src={props.collageSources.getOverlayUrl(props.overlayLayerId)}
                previewSrc={props.collageSources.getOverlayUrl(props.overlayLayerId, true)}
                dimensions={overlayDimensions}
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