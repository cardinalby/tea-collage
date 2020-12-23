const os = require('os');
const PSD = require('psd');
const extractLayers = require('./extractLayers');

/**
 * @property {LayerInfo[]} layers
 * @property width
 * @property height
 */
class PsdProcessingResult {
    constructor(layers, width, height) {
        this.layers = layers;
        this.width = width;
        this.height = height;
    }
}

/**
 * @param psdFilePath
 * @param overlayGroupName
 * @param backgroundLayerName
 * @param outBackgroundFilePath
 * @param outOverlayDirPath
 * @returns {Promise<PsdProcessingResult>}
 */
async function processPsd(
    psdFilePath,
    overlayGroupName,
    backgroundLayerName,
    outBackgroundFilePath,
    outOverlayDirPath
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
    process.stdout.write(`Extracting ${backgroundLayerName} layer to ${outBackgroundFilePath}...`);
    await backgroundLayer[0].layer.image.saveAsPng(outBackgroundFilePath);
    process.stdout.write('done' + os.EOL);

    const layers = await extractLayers.extractFromGroup(overlayGroup[0], outOverlayDirPath)

    return new PsdProcessingResult(layers, psd.image.width(), psd.image.height());
}

module.exports = processPsd;

