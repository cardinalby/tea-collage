const os = require('os');
const PSD = require('psd');
const path = require('path')
const fs = require('fs-extra');
const extractLayers = require('./extractLayers');
const sanitizeFilename = require("sanitize-filename");

/**
 * @property {LayerInfo[]} overlayLayers
 * @property backgroundFileName
 * @property overlayDirName
 * @property width
 * @property height
 */
class PsdProcessingResult {
    constructor(overlayLayers, backgroundFileName, overlayDirName, width, height) {
        this.overlayLayers = overlayLayers;
        this.backgroundFileName = backgroundFileName;
        this.overlayDirName = overlayDirName;
        this.width = width;
        this.height = height;
    }

    copy() {
        return Object.assign(new PsdProcessingResult(), this, {
            overlayLayers: this.overlayLayers.map(layer => layer.copy()),
        });
    }
}

/**
 * @returns {Promise<PsdProcessingResult>}
 */
async function processPsd(
    psdFilePath,
    extractionDir,
    overlayGroupName,
    backgroundLayerName
) {
    const psd = PSD.fromFile(psdFilePath);
    psd.parse();

    const overlayGroup = psd.tree().childrenAtPath(overlayGroupName);
    if (overlayGroup.length === 0 || overlayGroup[0].type !== 'group') {
        throw new Error(`${overlayGroupName} group not found`);
    }

    const backgroundLayer = psd.tree().childrenAtPath(backgroundLayerName);
    if (backgroundLayer.length === 0 || backgroundLayer[0].type !== 'layer') {
        throw new Error(`${backgroundLayerName} layer not found`);
    }

    const outBackgroundFileName = sanitizeFilename(backgroundLayer[0].name) + '.png';
    const outBackgroundFilePath = path.join(extractionDir, outBackgroundFileName);

    process.stdout.write(`Extracting ${backgroundLayerName} layer to ${outBackgroundFilePath}...`);
    await backgroundLayer[0].layer.image.saveAsPng(outBackgroundFilePath);
    process.stdout.write('done' + os.EOL);

    const overlayGroupDir = sanitizeFilename(overlayGroup[0].name);
    fs.ensureDir(path.join(extractionDir, overlayGroupDir));
    const layers = await extractLayers.extractFromGroup(overlayGroup[0], extractionDir, overlayGroupDir);

    return new PsdProcessingResult(
        layers,
        outBackgroundFileName,
        overlayGroupDir,
        psd.image.width(),
        psd.image.height()
    );
}

module.exports = processPsd;

