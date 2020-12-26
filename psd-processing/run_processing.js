const os = require('os');
const collageInfo = require('./collageInfo');
const consts = require('./consts');
const processPsd = require('./processPsd');
const resizing = require('./resizing');
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
    await emptyDir(consts.RESIZED_DIR);
    for (const size of psdConfig.targetSizes) {
        await emptyDir(path.join(consts.RESIZED_DIR, size.name));
        const scale = size.width / psdResult.width;

        const destDir = path.join(consts.RESIZED_DIR, size.name);

        const psdResultCopy = psdResult.copy();
        psdResultCopy.backgroundFileName = sanitizeFilename(psdConfig.layers.background) + '.jpg';
        await resizing.resizeFile(
            path.join(consts.EXTRACTED_DIR, psdResult.backgroundFileName),
            path.join(destDir, psdResultCopy.backgroundFileName),
            size.preview ? scale * 1.7 : scale,
            {
                jpeg: size.preview ? 60 : 100,
                grayscale: size.preview
            }
        );

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

        resizing.adjustPsdResult(psdResultCopy, scale);

        const collage = size.preview
            ? collageInfo.createPreview(psdResultCopy)
            : collageInfo.create(psdResultCopy, consts.MAP_NAME)
        await fs.writeJson(collageInfoFile, collage);
        process.stdout.write('done' + os.EOL)
    }
    await fs.remove(consts.EXTRACTED_DIR);
    await fs.writeJson(
        path.join(consts.COLLAGE_INFO_DIR, consts.COLLAGE_INFO_SIZES_JSON),
        psdConfig.targetSizes
    );
})();

