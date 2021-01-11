import '../css/infoWindow.css';
import photosSources from "../models/photosSources";
import {SmoothImage} from "./SmoothImage";
import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {useHistory} from "react-router-dom";
import {classNames} from "../models/reactUtils";

export interface InfoWindowProps {
    itemId?: string
}

export function InfoWindow(props: InfoWindowProps) {
    const {t} = useTranslation();
    const history = useHistory();

    const paragraphsContent = (props.itemId
        ? t(`teas.${props.itemId}.description`, { returnObjects: true })
        : t(`about.description`, { returnObjects: true })) as string[];
    const title = props.itemId
        ? t(`teas.${props.itemId}.name`, { returnObjects: true })
        : t(`about.title`);
    const imgSrc = props.itemId
        ? photosSources.getTeaPhotoUrl(props.itemId)
        : photosSources.getPhotoUrl('about.jpg');
    const imgPreviewSrc = props.itemId
        ? photosSources.getTeaPhotoUrl(props.itemId, true)
        : photosSources.getPhotoUrl('about.jpg', true);

    const paragraphs = paragraphsContent.map((paragraph, index) => <p key={index}>{paragraph}</p>);

    const [isImgZoomed, setImgZoomed] = useState(true);

    function onCloseClick() {
        history.replace('/collage/');
    }

    function onImageClick() {
        setImgZoomed(!isImgZoomed);
    }

    return (
        <div className='info-window'>
            <div className='title'>{title}</div>
            <div className='info-close' onClick={onCloseClick}>×</div>
            <div className='info-container'>
                {
                    imgSrc &&
                    <SmoothImage
                        src={imgSrc}
                        previewSrc={imgPreviewSrc}
                        containerProps={{
                            className: classNames(
                                'smooth-image',
                                isImgZoomed && 'zoomed'
                            )
                        }}
                        imgProps={{onClick: onImageClick}}
                    />
                }
                {paragraphs}
            </div>
        </div>
    );
}