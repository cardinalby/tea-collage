const areasConfig = require('../resources/img-areas-config.json');

/**
 * @property id
 * @property fileName
 * @property left
 * @property top
 */
class CollageItem {
    constructor(id, fileName, left, top) {
        this.id = id;
        this.fileName = fileName;
        this.left = left;
        this.top = top;
    }
}

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
}

function updateAreaStyle(area, layerConfig) {
    if (layerConfig.strokeColor) {
        area.strokeColor = layerConfig.strokeColor;
    }
    if (layerConfig.fillColor) {
        area.fillColor = layerConfig.fillColor;
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
 * @property overlayItems
 * @property {ImgAreasMap} imgAreasMap
 * @property width
 * @property height
 */
class CollageInfo {
    constructor(overlayItems, imgAreasMap, width, height) {
        this.overlayItems = overlayItems;
        this.imgAreasMap = imgAreasMap;
        this.width = width;
        this.height = height;
    }
}

/**
 * @param {PsdProcessingResult} psdProcessingResult
 * @return {object}
 */
function getOverlayItems(psdProcessingResult) {
    return Object.fromEntries(psdProcessingResult.layers.map(layer =>
        [
            layer.name,
            new CollageItem(
                layer.name,
                layer.fileName,
                layer.left,
                layer.top
            )
        ]
    ));
}

/**
 * @param {PsdProcessingResult} psdProcessingResult
 * @param name
 * @return {object}
 */
function getImgAreasMap(psdProcessingResult, name) {
    const imgAreasMap = new ImgAreasMap(name, []);
    for (const layer of psdProcessingResult.layers) {
        for (const subPath of layer.maskPath.subPathes) {
            const layerConfig = areasConfig[layer.name];
            const area = new ImgArea('poly', subPath.getImgMapCoords(), layer.name);
            if (layerConfig) {
                updateAreaStyle(area, layerConfig);
            }
            imgAreasMap.areas.push(area);
        }
    }
    return imgAreasMap;
}

/**
 * @param {PsdProcessingResult} psdProcessingResult
 * @param name
 */
function create(psdProcessingResult, name) {
    return new CollageInfo(
        getOverlayItems(psdProcessingResult),
        getImgAreasMap(psdProcessingResult, name),
        psdProcessingResult.width,
        psdProcessingResult.height
    );
}

/**
 * @param {CollageInfo} collageInfo
 */
function updateImgAreas(collageInfo) {
    for (const area of collageInfo.imgAreasMap.areas) {
        const layerConfig = areasConfig[area.group];
        if (layerConfig) {
            updateAreaStyle(area, layerConfig);
        }
    }
}

exports.create = create;
exports.updateImgAreas = updateImgAreas;