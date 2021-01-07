import {PsdParsingResult} from "../psdParsing/psdParsingResult";
import * as consts from "../consts";
import * as fs from "fs-extra";
import path from "path";
import * as os from "os";
const psdConfig = require('../../../resources/psd-config.json');
import CollageSizeDef = generatedJson.CollageSizeDef;
const getFolderSize = require('get-folder-size');

async function getDirSize(targetSizeName: string): Promise<number> {
    const dirPath = path.join(consts.RESIZED_DIR, targetSizeName);
    return new Promise<number>((resolve, reject) => {
        getFolderSize(dirPath, (err, size) => {
            if (err) {
                reject(err);
            } else {
                resolve(size);
            }
        });
    });
}

async function getCollageSizeDef(targetSize, imgRatio: number, imagesCount: number): Promise<CollageSizeDef> {
    const avgImgSize = (await getDirSize(targetSize.name)) / imagesCount;
    return {
        name: targetSize.name,
        width: targetSize.width || Math.round(targetSize.height / imgRatio),
        height: targetSize.height || Math.round(targetSize.width * imgRatio),
        preview: targetSize.preview,
        avgImgSize: Math.round(avgImgSize)
    };
}

export async function saveSizes(psdResult: PsdParsingResult): Promise<void> {
    process.stdout.write(`Writing ${consts.COLLAGE_INFO_SIZES_JSON}...`);
    const imgRatio = psdResult.height / psdResult.width;

    const imagesCount = psdResult.overlayLayers.length + 1; // plus background
    const sizes = await Promise.all(
        psdConfig.targetSizes.map(targetSize => getCollageSizeDef(targetSize, imgRatio, imagesCount))
    );

    await fs.writeJson(
        path.join(consts.COLLAGE_INFO_DIR, consts.COLLAGE_INFO_SIZES_JSON),
        sizes
    );
    process.stdout.write('done' + os.EOL)
}