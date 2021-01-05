import React, {useState} from "react";
import { useTranslation } from 'react-i18next';
import { Button, Wrapper, Menu, MenuItem } from 'react-aria-menubutton';
import {classNames} from "../models/reactUtils";

export interface QualitySelectorProps {
    sizes: generatedJson.CollageSizeDef[],
    initSizeName: string,
    onChange?: (sizeName: string) => void
}

export function QualitySelector(props: QualitySelectorProps) {
    const { t } = useTranslation();
    const [selectedSizeName, setSelectedSizeName] = useState(props.initSizeName);
    const sizeShortName = t('sizes.' + selectedSizeName)[0];

    const menuItems = props.sizes.map(sizeDef => {
        return (
            <MenuItem className={classNames([
                          'quality-selector-option',
                           selectedSizeName === sizeDef.name ? 'current-option' : undefined
                      ])}
                      value={sizeDef.name}>
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
        setSelectedSizeName(val);
        props.onChange && props.onChange(val);
    }

    return (
        <Wrapper
            className='quality-selector'
            onSelection={onSelection}
        >
            <Button className='quality-selector-button' tag={'div'}>
                {sizeShortName}
            </Button>
            <Menu className='quality-selector-menu'>
                <div>
                    {menuItems}
                </div>
            </Menu>
        </Wrapper>
    );
}