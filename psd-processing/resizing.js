const sharp = require('sharp');
const os = require('os');
const v8 = require('v8');

/**
 * @param srcFilePath
 * @param targetFilePath
 * @param scale
 * @param {boolean|number|undefined} options.jpeg
 * @param {boolean|undefined} options.grayscale
 * @return {Promise<*>}
 */
async function resizeFile(srcFilePath, targetFilePath, scale, options) {
    const img = sharp(srcFilePath);
    const metadata = await img.metadata();
    const newSize = {
        width: Math.round(metadata.width * scale),
        height: Math.round(metadata.height * scale),
    };

    process.stdout.write(`Resizing ${targetFilePath}...`);

    img.resize(newSize)
    if (options.grayscale) {
        img
            .toColourspace('b-w')
            .grayscale();
    }
    if (options.jpeg) {
        img
            .toFormat('jpeg')
            .jpeg({
                quality: Number.isFinite(options.jpeg) ? options.jpeg : 100,
                progressive: true
            });
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
        layer.width = Math.round(layer.width * resizeFactor);
        layer.height = Math.round(layer.height * resizeFactor);

        layer.maskPath.convertToAbsCoords(psdResult.width, psdResult.height);
    }
}

exports.resizeFile = resizeFile;
exports.adjustPsdResult = adjustPsdResult;