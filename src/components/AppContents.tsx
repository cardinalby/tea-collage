import {useHistory} from "react-router-dom";
import Collage from "./Collage";
import {InfoWindow, TranslatedData} from "./InfoWindow";
import {ControlPanel} from "./ControlPanel";
import React, {SyntheticEvent, useMemo} from "react";
import {useStateSafe} from "../hooks/useStateSafe";
import collageSourcesSet from "../models/collageSourcesSet";
import {useWindowAspectRatioClass} from "../hooks/useWindowAspectRatio";
import {getRecommendedCollageSize, saveSizePref} from "../models/sizeAutoSelector";
import {useTranslation} from "react-i18next";
import {Redirect} from "react-router";
import photosSources from "../models/photosSources";

export interface AppContentsProps {
    section: string,
    itemId?: string
}

export function AppContents(props: AppContentsProps) {
    const history = useHistory();
    const {t, i18n} = useTranslation();
    const [collageSizeName, setCollageSizeName] = useStateSafe(getRecommendedCollageSize(collageSourcesSet.getSizes()));
    const collageSources = useMemo(() =>
            collageSourcesSet.getSources(collageSizeName),
        [collageSizeName]
    );
    useWindowAspectRatioClass(document.body, {
        'horizontal-control-panel': aspectRatio => aspectRatio < collageSourcesSet.collageAspectRatio
    });

    function onCollageSizeChange(size: string) {
        setCollageSizeName(saveSizePref(size));
    }

    function onMainAreaClick(event: SyntheticEvent<HTMLDivElement, MouseEvent>) {
        if (event.target === event.currentTarget) {
            history.replace('/collage/');
        }
    }

    let infoWindow: JSX.Element|undefined = undefined;
    let collageLayerId: string|undefined = undefined;
    let redirect = true;

    if (props.section === 'description' && props.itemId) {
        const translatedData = t(
            `teas.${props.itemId}`,
            { returnObjects: true, defaultValue: false }
            ) as TranslatedData;
        if (translatedData) {
            const [imgSrc, previewSrc] = [false, true]
                .map(preview => photosSources.getTeaPhotoUrl(props.itemId!!, preview));

            infoWindow = (<InfoWindow
                translatedData={translatedData}
                imgSrc={imgSrc}
                previewSrc={previewSrc}
                />);
            redirect = false;
        }
    } else if (props.section === 'collage' && (!props.itemId || collageSources.getOverlayUrl(props.itemId))) {
        collageLayerId = props.itemId
        redirect = false;
    }

    return (
        <div className='app' lang={i18n && i18n.language}>
            <div className={'main-area'} onClick={onMainAreaClick}>
                {redirect && <Redirect to='/collage/'/>}
                <Collage
                    active={props.section === 'collage'}
                    layerId={collageLayerId}
                    collageSources={collageSources}
                />
                {infoWindow}
            </div>
            <ControlPanel collageSizeName={collageSizeName} onCollageSizeChange={onCollageSizeChange}/>
        </div>
    );
}