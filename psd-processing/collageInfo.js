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
 */
class CollageInfo {
    constructor(overlayItems, background) {
        this.overlayItems = overlayItems;
        this.background = background;
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
 * @param {PsdProcessingResult} psdResult
 */
function createCollageInfo(psdResult) {
    return new CollageInfo(
        getOverlayItems(psdResult, false),
        new BackgroundInfo(
            psdResult.width,
            psdResult.height,
            psdResult.backgroundFileName
        )
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