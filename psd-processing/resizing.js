const sharp = require('sharp');
const os = require('os');
const path = require('path');

/**
 * @param srcFilePath
 * @param targetDir
 * @param scale
 * @param {'png'|'jpg'|'webp'} format
 * @param {Object} options
 * @param {number|undefined} options.alphaQuality
 * @param {number|undefined} options.quality
 * @param {boolean|undefined} options.grayscale
 * @return {Promise<*>}
 */
async function resizeFile(srcFilePath, targetDir, scale, format, options = {}) {
    const img = sharp(srcFilePath);
    const metadata = await img.metadata();
    const newSize = {
        width: Math.round(metadata.width * scale),
        height: Math.round(metadata.height * scale),
    };

    const targetFileName = path.parse(srcFilePath).name + '.' + format;
    process.stdout.write(`Resizing ${targetFileName}...`);

    img.resize(newSize)
    if (options.grayscale) {
        img
            .toColourspace('b-w')
            .grayscale();
    }
    switch (format) {
        case "jpg": img
            .toFormat('jpeg')
            .jpeg({
                quality: Number.isFinite(options.quality) ? options.quality : 100,
                progressive: true
            });
            break;
        case "png": img
            .toFormat('png')
            .png({progressive: true});
            break;
        case "webp": img
            .toFormat('webp')
            .webp({
                alphaQuality: options.alphaQuality,
                quality: options.quality,
                reductionEffort: 6,
                nearLossless: true
            });
    }

    return img
        .toFile(path.join(targetDir, targetFileName))
        .then(() => {
            process.stdout.write('done' + os.EOL);
            return targetFileName;
        });
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
    }
}

exports.resizeFile = resizeFile;
exports.adjustPsdResult = adjustPsdResult;