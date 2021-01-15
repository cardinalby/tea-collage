import '../css/infoWindow.css';
import {ReactComponent as CloseIcon} from "../images/close_icon.svg";
import {SmoothImage} from "./SmoothImage";
import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {useHistory} from "react-router-dom";
import {classNames} from "../models/reactUtils";
import {useDocumentKeyDown} from "../hooks/useDocumentKeyDown";
import {useDocumentTitle} from "../hooks/useDocumentTitle";

export interface TranslatedData {
    name: string,
    description: string[];
}

export interface InfoWindowProps {
    translatedData: TranslatedData,
    imgSrc?: string,
    previewSrc?: string
}

export function InfoWindow(props: InfoWindowProps) {
    const {t} = useTranslation();
    const history = useHistory();

    useDocumentTitle(t('document_title.item_description', {item: props.translatedData.name}));

    function goToCollage() {
        history.push('/collage/');
    }

    useDocumentKeyDown(event => {
        if (event.code === 'Escape') {
            goToCollage();
        }
    });

    const [isImgZoomed, setImgZoomed] = useState(false);

    const paragraphs = props.translatedData.description.map(
        (paragraph, index) => <p key={index}>{paragraph}</p>
    );

    function onCloseClick() {
        goToCollage();
    }

    function onImageClick() {
        setImgZoomed(!isImgZoomed);
    }

    return (
        <div className='info-window'>
            <CloseIcon className='info-close' onClick={onCloseClick} title={t('actions.close')}/>
            <div className='info-container'>
                <div className='title-text'>{props.translatedData.name}</div>
                {
                    props.imgSrc &&
                    <SmoothImage
                        src={props.imgSrc}
                        previewSrc={props.previewSrc}
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