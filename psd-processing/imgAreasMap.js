const areasConfig = require('../resources/img-areas-config.json');

/**
 * @property shape
 * @property coords
 * @property group
 * @property strokeColor
 * @property fillColor
 */
class ImgArea {
    constructor(shape, coords, group) {
        this.shape = shape;
        this.coords = coords;
        this.group = group;
    }

    static updateAreaStyle(area, layerConfig) {
        if (layerConfig.strokeColor) {
            area.strokeColor = layerConfig.strokeColor;
        }
        if (layerConfig.fillColor) {
            area.fillColor = layerConfig.fillColor;
        }
    }
}

/**
 * @property name
 * @property {ImgArea[]} areas
 */
class ImgAreasMap {
    constructor(name, areas) {
        this.name = name;
        this.areas = areas;
    }
}

/**
 * @param {PsdProcessingResult} psdProcessingResult
 * @param name
 * @return {object}
 */
function getImgAreasMap(psdProcessingResult, name) {
    const imgAreasMap = new ImgAreasMap(name, []);
    for (const layer of psdProcessingResult.overlayLayers) {
        for (const subPath of layer.maskPath.subPathes) {
            const layerConfig = areasConfig[layer.name];
            const area = new ImgArea(
                'poly',
                subPath.getImgMapCoords(psdProcessingResult.width, psdProcessingResult.height),
                layer.name
            );
            if (layerConfig) {
                ImgArea.updateAreaStyle(area, layerConfig);
            }
            imgAreasMap.areas.push(area);
        }
    }
    return imgAreasMap;
}

/**
 * @param {ImgAreasMap} imgAreasMap
 */
function updateImgAreas(imgAreasMap) {
    for (const area of imgAreasMap.areas) {
        const layerConfig = areasConfig[area.group];
        if (layerConfig) {
            ImgArea.updateAreaStyle(area, layerConfig);
        }
    }
}

exports.getImgAreasMap = getImgAreasMap;
exports.updateImgAreas = updateImgAreas;