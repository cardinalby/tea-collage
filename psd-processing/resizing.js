const sharp = require('sharp');
const os = require('os');
const v8 = require('v8');

async function resizeFile(srcFilePath, targetFilePath, factor, processing) {
    const img = sharp(srcFilePath);
    const metadata = await img.metadata();
    const newSize = {
        width: Math.round(metadata.width * factor),
        height: Math.round(metadata.height * factor),
    };

    process.stdout.write(`Resizing ${targetFilePath}...`);

    img.resize(newSize)

    if (processing) {
        processing(img);
    }

    return img
        .toFile(targetFilePath)
        .then(() => process.stdout.write('done' + os.EOL));
}

/**
 * @param {PsdProcessingResult} psdResult
 * @param resizeFactor
 */
function adjustPsdResult(psdResult, resizeFactor) {
    psdResult.width = Math.round(psdResult.width * resizeFactor);
    psdResult.height = Math.round(psdResult.height * resizeFactor);

    for (const layer of psdResult.overlayLayers) {
        layer.left = Math.round(layer.left * resizeFactor);
        layer.top = Math.round(layer.top * resizeFactor);

        layer.maskPath.convertToAbsCoords(psdResult.width, psdResult.height);
    }
}

exports.resizeFile = resizeFile;
exports.adjustPsdResult = adjustPsdResult;