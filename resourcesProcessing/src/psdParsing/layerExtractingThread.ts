import {OverlayLayerInfo} from "./psdParsingResult";

const { parentPort } = require("worker_threads");
const PSD = require('psd');
const path = require('path');
const sanitizeFilename = require("sanitize-filename");

export interface LayerExtractionTaskData {
    groupDir: string,
    extractionDir: string,
    layerPath: string,
    psdFilePath: string
}

async function extractLayer(data: LayerExtractionTaskData) {
    const psd = PSD.fromFile(data.psdFilePath);
    psd.parse();
    const layer = psd.tree().childrenAtPath(data.layerPath)[0];
    const fileName = sanitizeFilename(layer.name) + '.png';
    const layerInfo: OverlayLayerInfo = {
        fileName: path.join(data.groupDir, fileName),
        name: layer.name,
        left: layer.left,
        top: layer.top,
        width: layer.width,
        height: layer.height
    }

    await layer.layer.image.saveAsPng(path.join(data.extractionDir, layerInfo.fileName));

    return layerInfo;
}

parentPort.on("message", async (data: LayerExtractionTaskData) => {
    try {
        const layerInfo = await extractLayer(data);
        console.log(`${layerInfo.name} layer extracted to ${layerInfo.fileName}`);
        parentPort.postMessage(layerInfo);
    } catch (e) {
        parentPort.postMessage(e.stack);
    }
});