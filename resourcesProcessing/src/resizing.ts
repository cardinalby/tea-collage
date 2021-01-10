import sharp from 'sharp';
import {PsdParsingResult} from "./psdParsing/psdParsingResult";
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

export interface SizeSettings {
    scale?: number
    width?: number,
    height?: number
}

function getNewSize(currentWidth: number, currentHeight: number, size: SizeSettings): {width: number, height: number} {
    if (size.scale !== undefined) {
        return {
            width: Math.round(currentWidth * size.scale),
            height: Math.round(currentHeight * size.scale),
        }
    }
    if (size.width !== undefined && size.height === undefined) {
        return {
            width: size.width,
            height: Math.round(currentHeight * size.width / currentWidth)
        };
    }
    if (size.height !== undefined && size.width === undefined) {
        return {
            width: Math.round(currentWidth * size.height / currentHeight),
            height: size.height
        };
    }
    if (size.height !== undefined && size.width !== undefined) {
        return {
            width: size.width,
            height: size.height
        }
    }
    return {
        width: currentWidth,
        height: currentHeight
    };
}

export async function resizeFile(
    srcFilePath: string,
    targetDir: string,
    size: SizeSettings,
    format: ImageFileFormat,
    options: ResizingOptions = {}
): Promise<string>
{
    const img = sharp(srcFilePath);
    const metadata = await img.metadata();
    if (!metadata.width || !metadata.height) {
        throw new Error(`Can't read dimensions of ${srcFilePath} image`);
    }
    const newSize = getNewSize(metadata.width, metadata.height, size);
    const targetFileName = path.parse(srcFilePath).name + '.' + format;
    const targetFilePath = path.join(targetDir, targetFileName);
    console.log(`Resizing ${targetFilePath}`);

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

    await img.toFile(targetFilePath);
    return targetFileName;
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