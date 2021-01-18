import '../css/spinner.css';
import React, {useMemo} from "react";
import {classNames} from "../models/reactUtils";
import {SmoothImage} from "./SmoothImage";
import {CollageSources} from "../models/collageSources";
import {useTranslation} from "react-i18next";

interface TeapotSpinnerProps {
    active: boolean,
    scale: number,
    collageSources: CollageSources
}

function TeapotSpinner(props: TeapotSpinnerProps) {
    const {t} = useTranslation();
    const dimensions = useMemo(
        () => props.collageSources.getOverlayDimensions('teapot_spinner').scale(props.scale),
        [props.collageSources, props.scale]
    );

    return (
        <div className={classNames(
            'teapot-spinner',
            props.active ? 'active' : 'disabled'
        )}>
            <SmoothImage
                componentId={'teapot_spinner'}
                src={props.collageSources.getOverlayUrl('teapot_spinner')}
                previewSrc={props.collageSources.getOverlayUrl('teapot_qr')}
                imgProps={{
                    style: {
                        left: dimensions.left,
                        top: dimensions.top,
                        width: dimensions.width,
                        height: dimensions.height,
                    },
                    alt: t(`teas.about.name`),
                }}
            />
        </div>
    );
}

export default TeapotSpinner;