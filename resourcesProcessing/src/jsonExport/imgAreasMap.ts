import {PsdParsingResult, SubPath} from "../psdParsing/psdParsingResult";
import Area = generatedJson.Area;
import ImgAreaConfig = resourcesConfig.ImgAreaConfig;
import ImgAreasConfig = resourcesConfig.ImgAreasConfig;

const areasConfig: ImgAreasConfig = require('../../../resources/img-areas-config.json');

function getImgMapCoords(subPath: SubPath, restrictWidth: number, restrictHeight: number): number[] {
    const coords: number[] = [];
    const limitValue = (value, from, to) => value < from ? from : (value > to ? to : value);
    for (let point of subPath) {
        coords.push(
            restrictWidth ? limitValue(point.x, 0, restrictWidth) : point.x,
            restrictHeight ? limitValue(point.y, 0, restrictHeight) : point.y
        );
    }
    return coords;
}

function updateAreaStyle(area: Area, config: ImgAreaConfig) {
    if (config.strokeColor) {
        area.strokeColor = config.strokeColor;
    }
    if (config.fillColor) {
        area.fillColor = config.fillColor;
    }
    if (config.lineWidth) {
        area.lineWidth = config.lineWidth;
    }
}

export function getImgAreas(psdProcessingResult: PsdParsingResult): Area[] {
    const imgAreas: Area[] = [];
    for (const areaLayer of psdProcessingResult.areaLayers) {
        for (const subPath of areaLayer.path) {
            const area: Area = {
                shape: 'poly',
                coords: getImgMapCoords(subPath, psdProcessingResult.width, psdProcessingResult.height),
                group: areaLayer.name
            };
            const layerConfig = areasConfig[areaLayer.name];
            if (layerConfig) {
                updateAreaStyle(area, layerConfig);
            }
            imgAreas.push(area);
        }
    }
    return imgAreas;
}

export function updateImgAreasStyle(areas: Area[]) {
    for (const area of areas) {
        const layerConfig = areasConfig[area.group];
        if (layerConfig) {
            updateAreaStyle(area, layerConfig);
        }
    }
}