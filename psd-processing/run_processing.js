const os = require('os');
const collageInfo = require('./collageInfo');
const consts = require('./consts');
const processPsd = require('./processPsd');
const resizing = require('./resizing');
const fs = require('fs-extra');
const path = require('path')
const psdConfig = require('../resources/psd-config.json');

async function prepareImagesDir(dirPath) {
    if (await fs.exists(dirPath)) {
        await fs.emptyDir(dirPath);
    }
    await fs.ensureDir(path.join(dirPath, consts.OVERLAY_DIR));
}

(async function() {
    await prepareImagesDir(consts.EXTRACTED_DIR);
    const psdResult = await processPsd(
        path.join(consts.RESOURCES_DIR, psdConfig.psdFile),
        psdConfig.layers.overlayGroup,
        psdConfig.layers.background,
        path.join(consts.EXTRACTED_DIR, consts.BACKGROUND_FILE),
        path.join(consts.EXTRACTED_DIR, consts.OVERLAY_DIR)
    );

    await prepareImagesDir(consts.RESIZED_DIR);
    const resizeFactor = psdConfig.targetWidth / psdResult.width;
    await resizing.resizeFile(
        path.join(consts.EXTRACTED_DIR, consts.BACKGROUND_FILE),
        path.join(consts.RESIZED_DIR, consts.BACKGROUND_FILE_JPG),
        resizeFactor,
        true
    );

    for (const layer of psdResult.layers) {
        await resizing.resizeFile(
            path.join(consts.EXTRACTED_DIR, consts.OVERLAY_DIR, layer.fileName),
            path.join(consts.RESIZED_DIR, consts.OVERLAY_DIR, layer.fileName),
            resizeFactor
        )
    }
    await fs.remove(consts.EXTRACTED_DIR);

    process.stdout.write(`Preparing ${consts.COLLAGE_INFO_FILE}...`);

    resizing.adjustPsdResult(psdResult, resizeFactor);

    await fs.writeJson(
        consts.COLLAGE_INFO_FILE,
        collageInfo.create(psdResult, consts.MAP_NAME)
    );
    process.stdout.write('done' + os.EOL)
})();

