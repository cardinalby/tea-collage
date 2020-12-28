const { parentPort, workerData } = require("worker_threads");
const PSD = require('psd');
const path = require('path');
const sanitizeFilename = require("sanitize-filename");
const psdPath = require('../psdPath')
const LayerInfo = require('../extractLayers').LayerInfo;

/**
 * @typedef {Object} LayerExtractingData
 * @property {string} groupDir
 * @property {string} extractionDir
 * @property {string} layerPath
 * @property {string} psdFilePath
 **/

async function extractLayer(/** LayerExtractingData */ data) {
    const psd = PSD.fromFile(data.psdFilePath);
    psd.parse();
    const layer = psd.tree().childrenAtPath(data.layerPath)[0];
    const vectorMask = layer.get('vectorMask');
    if (!vectorMask) {
        throw new Error(`Overlay layer ${layer.name} doesn't have vector mask`);
    }
    const fileName = sanitizeFilename(layer.name) + '.png';
    const layerInfo = new LayerInfo(
        path.join(data.groupDir, fileName),
        layer.name,
        layer.left,
        layer.top,
        layer.width,
        layer.height,
        psdPath.parsePaths(vectorMask.export().paths)
    );

    await layer.layer.image.saveAsPng(path.join(data.extractionDir, layerInfo.fileName));

    return layerInfo;
}

parentPort.on("message", /** LayerExtractingData */ async data => {
    try {
        const layerInfo = await extractLayer(data);
        console.log(`${layerInfo.name} layer extracted to ${layerInfo.fileName}`);
        parentPort.postMessage(layerInfo);
    } catch (e) {
        parentPort.postMessage(e.stack);
    }
});