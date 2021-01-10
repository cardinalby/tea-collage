import * as consts from './consts';
import * as fs from 'fs-extra';
import {copyPsdParsingResult, PsdParsingResult} from "./psdParsing/psdParsingResult";
import {getImgAreas} from "./jsonExport/imgAreasMap";
import {adjustPsdResult, resizeFile} from "./resizing";
import {processPsd} from "./psdParsing/processPsd";
import {createFullCollageInfo, createPreviewCollageInfo} from "./jsonExport/collageInfo";
import {saveSizes} from "./jsonExport/sizes";
import {makePhotosPreviews} from "./photosPreviews";
import {createPhotosInfo} from "./jsonExport/photosInfo";

const os = require('os');
const path = require('path')
const processingConfig = require('../../resources/processing-config.json');

async function emptyDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
    await fs.emptyDir(dirPath);
}

async function saveImgAreas(psdResult: PsdParsingResult): Promise<void> {
    const imgAreasMapFile = path.join(consts.COLLAGE_INFO_DIR, consts.COLLAGE_INFO_AREAS_MAP_JSON);
    process.stdout.write(`Preparing ${imgAreasMapFile}...`);
    const imgAreasMap = getImgAreas(psdResult);
    await fs.writeJson(imgAreasMapFile, imgAreasMap);
    process.stdout.write('done' + os.EOL);
}

async function saveResizedBackground(
    psdResult: PsdParsingResult,
    psdResultResized: PsdParsingResult,
    preview: boolean,
    destDir: string
): Promise<void> {
    const resizedScale = psdResultResized.width / psdResult.width;
    psdResultResized.backgroundFileName = await resizeFile(
        path.join(consts.EXTRACTED_DIR, psdResult.backgroundFileName),
        destDir,
        {scale: preview ? resizedScale * 1.7 : resizedScale},
        'jpg',
        {
            quality: preview ? 60 : 100,
            alphaQuality: 0,
            grayscale: preview
        }
    );
}

(async function() {
    await emptyDir(consts.EXTRACTED_DIR);
    const psdResult = await processPsd(
        path.join(consts.RESOURCES_DIR, processingConfig.psdFile),
        consts.EXTRACTED_DIR,
        processingConfig.layers.overlayGroup,
        processingConfig.layers.areasGroup,
        processingConfig.layers.background
    );

    await fs.ensureDir(consts.COLLAGE_INFO_DIR);
    await fs.emptyDir(consts.COLLAGE_INFO_DIR);

    await saveImgAreas(psdResult);

    await emptyDir(consts.RESIZED_DIR);

    for (const size of processingConfig.targetSizes) {
        await emptyDir(path.join(consts.RESIZED_DIR, size.name));
        const scale = size.width ? (size.width / psdResult.width) : (size.height / psdResult.height);

        const destDir = path.join(consts.RESIZED_DIR, size.name);

        const psdResultCopy = copyPsdParsingResult(psdResult);
        adjustPsdResult(psdResultCopy, scale);

        await saveResizedBackground(psdResult, psdResultCopy, size.preview, destDir);

        await fs.ensureDir(path.join(destDir, psdResultCopy.overlayDirName));
        const overlaysResizing = psdResultCopy.overlayLayers.map(async layer => {
            const fileName = await resizeFile(
                path.join(consts.EXTRACTED_DIR, layer.fileName),
                path.join(destDir, psdResult.overlayDirName),
                {scale: scale},
                'png',
                {
                    grayscale: size.preview,
                    quality: size.preview ? 50: 100,
                    alphaQuality: 30
                }
            )
            layer.fileName = path.join(psdResult.overlayDirName, fileName);
        });
        await Promise.all(overlaysResizing);

        const collageInfoFile = path.join(consts.COLLAGE_INFO_DIR, size.name + '.json');
        process.stdout.write(`Preparing ${collageInfoFile}...`);

        const collage = size.preview
            ? createPreviewCollageInfo(psdResultCopy)
            : createFullCollageInfo(psdResultCopy);

        await fs.writeJson(collageInfoFile, collage);
        process.stdout.write('done' + os.EOL);
    }
    await fs.remove(consts.EXTRACTED_DIR);
    await saveSizes(psdResult);

    const photosPreviewDir = path.join(consts.PHOTOS_DIR, consts.PHOTOS_PREVIEW_DIR);
    await emptyDir(photosPreviewDir);
    const photoFiles = await makePhotosPreviews(consts.PHOTOS_DIR, photosPreviewDir);
    const photosInfoFilePath = path.join(consts.COLLAGE_INFO_DIR, consts.PHOTOS_INFO_JSON);
    process.stdout.write(`Preparing ${photosInfoFilePath}...`);
    const photosInfo = createPhotosInfo(
        photoFiles,
        psdResult.areaLayers.map(layer => layer.name),
        consts.PHOTOS_PREVIEW_DIR
    );
    await fs.writeJson(photosInfoFilePath, photosInfo);
    process.stdout.write('done' + os.EOL);
})();

