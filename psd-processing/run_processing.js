const os = require('os');
const collageInfo = require('./collageInfo');
const consts = require('./consts');
const processPsd = require('./processPsd');
const resizing = require('./resizing');
const imageAreasMap = require('./imgAreasMap');
const fs = require('fs-extra');
const path = require('path')
const psdConfig = require('../resources/psd-config.json');
const sanitizeFilename = require("sanitize-filename");

/**
 * @return {Promise<void>}
 */
async function emptyDir(dirPath) {
    await fs.ensureDir(dirPath);
    await fs.emptyDir(dirPath);
}

/**
 * @param {PsdProcessingResult} psdResult
 */
async function saveImgAreas(psdResult) {
    const imgAreasMapFile = path.join(consts.COLLAGE_INFO_DIR, consts.COLLAGE_INFO_AREAS_MAP_JSON);
    process.stdout.write(`Preparing ${imgAreasMapFile}...`);
    const imgAreasMap = imageAreasMap.getImgAreasMap(psdResult, consts.MAP_NAME);
    await fs.writeJson(imgAreasMapFile, imgAreasMap);
    process.stdout.write('done' + os.EOL);
}

/**
 *
 * @param {PsdProcessingResult} psdResult
 * @param {PsdProcessingResult} psdResultResized
 * @param {boolean} preview
 * @param {string} destDir
 */
async function saveResizedBackground(psdResult, psdResultResized, preview, destDir) {
    psdResultResized.backgroundFileName = sanitizeFilename(psdConfig.layers.background) + '.jpg';
    const resizedScale = psdResultResized.width / psdResult.width;
    await resizing.resizeFile(
        path.join(consts.EXTRACTED_DIR, psdResult.backgroundFileName),
        path.join(destDir, psdResultResized.backgroundFileName),
        preview ? resizedScale * 1.7 : resizedScale,
        {
            jpeg: preview ? 60 : 100,
            grayscale: preview
        }
    );
}

(async function() {
    await emptyDir(consts.EXTRACTED_DIR);
    const psdResult = await processPsd(
        path.join(consts.RESOURCES_DIR, psdConfig.psdFile),
        consts.EXTRACTED_DIR,
        psdConfig.layers.overlayGroup,
        psdConfig.layers.background
    );

    await fs.ensureDir(consts.COLLAGE_INFO_DIR);
    await fs.emptyDir(consts.COLLAGE_INFO_DIR);

    await saveImgAreas(psdResult);

    await emptyDir(consts.RESIZED_DIR);
    for (const size of psdConfig.targetSizes) {
        await emptyDir(path.join(consts.RESIZED_DIR, size.name));
        const scale = size.width / psdResult.width;

        const destDir = path.join(consts.RESIZED_DIR, size.name);

        const psdResultCopy = psdResult.copy();
        resizing.adjustPsdResult(psdResultCopy, scale);

        await saveResizedBackground(psdResult, psdResultCopy, size.preview, destDir);

        await fs.ensureDir(path.join(destDir, psdResultCopy.overlayDirName));
        for (const layer of psdResultCopy.overlayLayers) {
            await resizing.resizeFile(
                path.join(consts.EXTRACTED_DIR, layer.fileName),
                path.join(destDir, layer.fileName),
                scale,
                {
                    grayscale: size.preview
                }
            )
        }

        const collageInfoFile = path.join(consts.COLLAGE_INFO_DIR, size.name + '.json');
        process.stdout.write(`Preparing ${collageInfoFile}...`);

        const collage = size.preview
            ? collageInfo.createPreview(psdResultCopy)
            : collageInfo.create(psdResultCopy)
        await fs.writeJson(collageInfoFile, collage);
        process.stdout.write('done' + os.EOL)
    }
    await fs.remove(consts.EXTRACTED_DIR);

    await fs.writeJson(
        path.join(consts.COLLAGE_INFO_DIR, consts.COLLAGE_INFO_SIZES_JSON),
        psdConfig.targetSizes
    );
})();

