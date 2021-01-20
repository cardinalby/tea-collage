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

console.log(process.argv);

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

async function resizeOverlays(
    destDir: string,
    psdResultCopy: PsdParsingResult,
    psdResult: PsdParsingResult,
    scale: number,
    size: any
) {
    await fs.ensureDir(path.join(destDir, psdResultCopy.overlayDirName));
    const layers = size.excludeLayers
        ? psdResultCopy.overlayLayers.filter(layer => size.excludeLayers.indexOf(layer.name) === -1)
        : psdResultCopy.overlayLayers;

    const overlaysResizing = layers.map(async layer => {
        const fileName = await resizeFile(
            path.join(consts.EXTRACTED_DIR, layer.fileName),
            path.join(destDir, psdResult.overlayDirName),
            {scale: scale},
            'png',
            {
                grayscale: size.preview,
                quality: size.preview ? 50 : 100,
                alphaQuality: 30
            }
        )
        layer.fileName = path.join(psdResult.overlayDirName, fileName);
    });

    await Promise.all(overlaysResizing);
}

async function processPhotos(psdResult: PsdParsingResult, skipImagesSaving: boolean) {
    const photosPreviewDir = path.join(consts.PHOTOS_DIR, consts.PHOTOS_PREVIEW_DIR);
    await emptyDir(photosPreviewDir);
    const photoFiles = await makePhotosPreviews(consts.PHOTOS_DIR, photosPreviewDir, skipImagesSaving);
    const photosInfoFilePath = path.join(consts.COLLAGE_INFO_DIR, consts.PHOTOS_INFO_JSON);
    process.stdout.write(`Preparing ${photosInfoFilePath}...`);
    const photosInfo = createPhotosInfo(
        photoFiles,
        psdResult.areaLayers.map(layer => layer.name),
        consts.PHOTOS_PREVIEW_DIR
    );
    await fs.writeJson(photosInfoFilePath, photosInfo);
    process.stdout.write('done' + os.EOL);
}

async function run_processing(skipImagesSaving: boolean) {
    await emptyDir(consts.EXTRACTED_DIR);
    const psdResult = await processPsd(
        path.join(consts.RESOURCES_DIR, processingConfig.psdFile),
        consts.EXTRACTED_DIR,
        processingConfig.layers.overlayGroup,
        processingConfig.layers.areasGroup,
        processingConfig.layers.background,
        skipImagesSaving
    );

    await emptyDir(consts.COLLAGE_INFO_DIR);

    await saveImgAreas(psdResult);

    if (!skipImagesSaving) {
        await emptyDir(consts.RESIZED_DIR);
    }

    for (const size of processingConfig.targetSizes) {

        const scale = size.width ? (size.width / psdResult.width) : (size.height / psdResult.height);
        const destDir = path.join(consts.RESIZED_DIR, size.name);
        if (!skipImagesSaving) {
            await emptyDir(path.join(consts.RESIZED_DIR, size.name));
        }

        const psdResultCopy = copyPsdParsingResult(psdResult);
        adjustPsdResult(psdResultCopy, scale);

        if (!skipImagesSaving) {
            await saveResizedBackground(psdResult, psdResultCopy, size.preview, destDir);
            await resizeOverlays(destDir, psdResultCopy, psdResult, scale, size);
        }

        const collageInfoFile = path.join(consts.COLLAGE_INFO_DIR, size.name + '.json');
        process.stdout.write(`Preparing ${collageInfoFile}...`);

        const collage = size.preview
            ? createPreviewCollageInfo(psdResultCopy, size.excludeLayers || [])
            : createFullCollageInfo(psdResultCopy, size.excludeLayers || []);

        await fs.writeJson(collageInfoFile, collage);
        process.stdout.write('done' + os.EOL);
    }
    if (!skipImagesSaving) {
        await fs.remove(consts.EXTRACTED_DIR);
    }
    await saveSizes(psdResult, skipImagesSaving);

    await processPhotos(psdResult, skipImagesSaving);
}

const skipImagesSaving = process.argv.length > 2 && process.argv[2] === '--skip-images-saving';
run_processing(skipImagesSaving)
    .then(() => console.log('Finished'));

