import React from "react";
import { Button, Wrapper, Menu, MenuItem } from 'react-aria-menubutton';
import {classNames} from "../models/reactUtils";
import {ReactComponent as GearIcon} from "../images/quality_gear.svg";
import '../css/qualitySelector.css';
import {useTranslation} from "react-i18next";

export interface QualitySelectorProps {
    sizes: generatedJson.CollageSizeDef[],
    currentSize: string,
    onChange?: (sizeName: string) => void
}

export function QualitySelector(props: QualitySelectorProps) {
    const {t} = useTranslation();
    const sizeShortName = t('sizes.' + props.currentSize)[0];

    const menuItems = props.sizes.map((sizeDef, index) => {
        return (
            <MenuItem
                className={classNames([
                    'quality-selector-option',
                    props.currentSize === sizeDef.name ? 'current-option' : undefined
                ])}
                value={sizeDef.name}
                key={index}
            >
                <span className="option-mark">{props.currentSize === sizeDef.name ? '✓' : ''}</span>
                <span className="quality-name">
                    {t('sizes.' + sizeDef.name)}
                </span>
                <span className="quality-resolution">
                    {`${sizeDef.width} × ${sizeDef.height}`}
                </span>
            </MenuItem>
        );
    });

    function onSelection(val: string) {
        props.onChange && props.onChange(val);
    }

    return (
        <Wrapper
            className='quality-selector'
            onSelection={onSelection}
        >
            <Button className='quality-selector-button' tag={'div'} title={t('actions.select_picture_quality')}>
                <GearIcon className="quality-gear-icon"/>
                <div className='quality-letter'>{sizeShortName}</div>
            </Button>
            <Menu className='quality-selector-menu'>
                <div>
                    {menuItems}
                </div>
            </Menu>
        </Wrapper>
    );
}