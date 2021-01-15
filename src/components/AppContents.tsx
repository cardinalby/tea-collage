import {useHistory} from "react-router-dom";
import Collage from "./Collage";
import {InfoWindow, TranslatedData} from "./InfoWindow";
import {ControlPanel} from "./ControlPanel";
import React, {SyntheticEvent, useMemo} from "react";
import {i18n} from "i18next";
import {useStateSafe} from "../hooks/useStateSafe";
import collageSourcesSet from "../models/collageSourcesSet";
import {useWindowAspectRatioClass} from "../hooks/useWindowAspectRatio";
import {getRecommendedCollageSize} from "../models/sizeAutoSelector";
import {useTranslation} from "react-i18next";
import {Redirect} from "react-router";
import photosSources from "../models/photosSources";

const recommendedCollageSize = getRecommendedCollageSize(collageSourcesSet.getSizes());

export interface AppContentsProps {
    i18n: i18n,
    section: string,
    itemId?: string
}

export function AppContents(props: AppContentsProps) {
    const history = useHistory();
    const {t} = useTranslation();
    const [collageSizeName, setCollageSizeName] = useStateSafe(recommendedCollageSize);
    const collageSources = useMemo(() =>
            collageSourcesSet.getSources(collageSizeName),
        [collageSizeName]
    );
    useWindowAspectRatioClass(document.body, {
        'horizontal-control-panel': aspectRatio => aspectRatio < collageSourcesSet.collageAspectRatio
    });

    function onMainAreaClick(event: SyntheticEvent<HTMLDivElement, MouseEvent>) {
        if (event.target === event.currentTarget) {
            history.replace('/collage/');
        }
    }

    let areaContent: JSX.Element|undefined = undefined;
    if (props.section === 'description' && props.itemId) {
        const isAboutInfo = props.itemId === 'about';
        const translatedData = t(
                isAboutInfo ? 'about' : `teas.${props.itemId}`,
                { returnObjects: true, defaultValue: false }
            ) as TranslatedData;
        if (translatedData) {
            const [imgSrc, previewSrc] = [false, true].map(preview => isAboutInfo
                ? photosSources.getPhotoUrl('about.jpg', preview)
                : photosSources.getTeaPhotoUrl(props.itemId!!, preview))

            areaContent = (<InfoWindow
                translatedData={translatedData}
                imgSrc={imgSrc}
                previewSrc={previewSrc}
                />);
        }
        else {
            areaContent = <Redirect to='/collage/'/>
        }
    } else if (props.section === 'collage') {
        if (props.itemId && !collageSources.getOverlayUrl(props.itemId)) {
            areaContent = <Redirect to='/collage/'/>
        } else {
            areaContent = (<Collage layerId={props.itemId} collageSources={collageSources}/>);
        }
    }

    return (
        <div className='app' lang={props.i18n && props.i18n.language}>
            <div className={'main-area'} onClick={onMainAreaClick}>
                {areaContent}
            </div>
            <ControlPanel collageSizeName={collageSizeName} onCollageSizeChange={setCollageSizeName}/>
        </div>
    );
}