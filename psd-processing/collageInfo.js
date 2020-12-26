const areasConfig = require('../resources/img-areas-config.json');

/**
 * @property fileName
 * @property left
 * @property top
 * @property width
 * @property height
 */
class CollageItem {
    constructor(fileName, left, top, width, height) {
        this.fileName = fileName;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
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
 * @property width
 * @property height
 * @property fileName
 */
class BackgroundInfo {
    constructor(width, height, fileName) {
        this.width = width;
        this.height = height;
        this.fileName = fileName;
    }
}

/**
 * @property {Object.<string, CollageItem>} overlayItems
 * @property {BackgroundInfo} background
 * @property {ImgAreasMap|undefined} imgAreasMap
 */
class CollageInfo {
    constructor(overlayItems, background, imgAreasMap) {
        this.overlayItems = overlayItems;
        this.background = background;
        this.imgAreasMap = imgAreasMap;
    }
}

/**
 * @param {PsdProcessingResult} psdProcessingResult
 * @param {boolean} preview
 * @return {object}
 */
function getOverlayItems(psdProcessingResult, preview) {
    return Object.fromEntries(psdProcessingResult.overlayLayers.map(layer =>
        [
            layer.name,
            new CollageItem(
                layer.fileName,
                preview ? undefined : layer.left,
                preview ? undefined : layer.top,
                preview ? undefined : layer.width,
                preview ? undefined : layer.height
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
    for (const layer of psdProcessingResult.overlayLayers) {
        for (const subPath of layer.maskPath.subPathes) {
            const layerConfig = areasConfig[layer.name];
            const area = new ImgArea('poly', subPath.getImgMapCoords(), layer.name);
            if (layerConfig) {
                ImgArea.updateAreaStyle(area, layerConfig);
            }
            imgAreasMap.areas.push(area);
        }
    }
    return imgAreasMap;
}

/**
 * @param {CollageInfo} collageInfo
 */
function updateImgAreas(collageInfo) {
    for (const area of collageInfo.imgAreasMap.areas) {
        const layerConfig = areasConfig[area.group];
        if (layerConfig) {
            ImgArea.updateAreaStyle(area, layerConfig);
        }
    }
}

/**
 * @param {PsdProcessingResult} psdResult
 * @param name
 */
function createCollageInfo(psdResult, name) {
    return new CollageInfo(
        getOverlayItems(psdResult, false),
        new BackgroundInfo(
            psdResult.width,
            psdResult.height,
            psdResult.backgroundFileName
        ),
        getImgAreasMap(psdResult, name)
    );
}

function createPreviewInfo(psdResult) {
    return new CollageInfo(
        getOverlayItems(psdResult, true),
        new BackgroundInfo(
            psdResult.width,
            psdResult.height,
            psdResult.backgroundFileName
        )
    );
}

exports.create = createCollageInfo;
exports.createPreview = createPreviewInfo;
exports.updateImgAreas = updateImgAreas;