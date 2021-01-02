import sharp from 'sharp';
import {PsdParsingResult} from "./psdParsing/psdParsingResult";
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
export type ImageFileFormat = 'png'|'jpg'|'webp';

export interface ResizingOptions {
    alphaQuality?: number,
    quality?: number,
    grayscale?: boolean
}

export async function resizeFile(
    srcFilePath: string,
    targetDir: string,
    scale: number,
    format: ImageFileFormat,
    options: ResizingOptions = {}
): Promise<string>
{
    const img = sharp(srcFilePath);
    const metadata = await img.metadata();
    if (!metadata.width || !metadata.height) {
        throw new Error(`Can't read dimensions of ${srcFilePath} image`);
    }
    const newSize = {
        width: Math.round(metadata.width * scale),
        height: Math.round(metadata.height * scale),
    };

    const targetFileName = path.parse(srcFilePath).name + '.' + format;
    const targetFilePath = path.join(targetDir, targetFileName);
    process.stdout.write(`Resizing ${targetFilePath}...`);

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
        .toFile(targetFilePath)
        .then(() => {
            process.stdout.write('done' + os.EOL);
            return targetFileName;
        });
}

export function adjustPsdResult(psdResult: PsdParsingResult, resizeFactor: number): void {
    psdResult.width = Math.round(psdResult.width * resizeFactor);
    psdResult.height = Math.round(psdResult.height * resizeFactor);

    for (const layer of psdResult.overlayLayers) {
        layer.left = Math.round(layer.left * resizeFactor);
        layer.top = Math.round(layer.top * resizeFactor);
        layer.width = Math.round(layer.width * resizeFactor);
        layer.height = Math.round(layer.height * resizeFactor);
    }
}