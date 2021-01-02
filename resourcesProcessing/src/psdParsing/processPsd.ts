import {AreaLayerInfo, Path, PsdParsingResult} from "./psdParsingResult";
import {parsePath} from "./psdPath";
import {checkNamesAreUnique, extractFromGroup} from "./extractLayers";

const os = require('os');
const PSD = require('psd');
const path = require('path')
const fs = require('fs-extra');

const sanitizeFilename = require("sanitize-filename");

function getChild(psd, type: 'layer'|'group', path: string) {
    const child = psd.tree().childrenAtPath(path);
    if (child.length === 0 || child[0].type !== type) {
        throw new Error(`${path} ${type} not found`);
    }
    return child[0];
}

function getVectorMaskPath(layer): Path {
    const vectorMask = layer.get('vectorMask');
    if (!vectorMask) {
        throw new Error(`Overlay layer ${layer.name} doesn't have vector mask`);
    }
    const result =  parsePath(vectorMask.export().paths);
    if (result.length === 0) {
        throw new Error(`No paths found in ${layer.name} vector mask`);
    }
    return result;
}

export async function processPsd(
    psdFilePath: string,
    extractionDir: string,
    overlayGroupName: string,
    areasGroupName: string,
    backgroundLayerName: string
): Promise<PsdParsingResult>
{
    const psd = PSD.fromFile(psdFilePath);
    psd.parse();

    const overlayGroup = getChild(psd, 'group', overlayGroupName);
    const backgroundLayer = getChild(psd, 'layer', backgroundLayerName);
    const areasGroup = getChild(psd, 'group', areasGroupName);

    process.stdout.write(`Parsing path from ${areasGroupName} group vector masks...`);
    const areaLayers = areasGroup.children()
        .filter(child => child.type === 'layer');
    checkNamesAreUnique(areaLayers);
    const areaLayerInfos: AreaLayerInfo[] = areaLayers.map(layer => ({
        name: layer.name,
        path: getVectorMaskPath(layer)
    } as AreaLayerInfo));
    process.stdout.write('done' + os.EOL);

    const outBackgroundFileName = sanitizeFilename(backgroundLayer.name) + '.png';
    const outBackgroundFilePath = path.join(extractionDir, outBackgroundFileName);

    process.stdout.write(`Extracting ${backgroundLayerName} layer to ${outBackgroundFilePath}...`);
    await backgroundLayer.layer.image.saveAsPng(outBackgroundFilePath);
    process.stdout.write('done' + os.EOL);

    const overlayGroupDir = sanitizeFilename(overlayGroup.name);
    await fs.ensureDir(path.join(extractionDir, overlayGroupDir));
    const overlayLayers = await extractFromGroup(
        overlayGroup, extractionDir, overlayGroupDir, psdFilePath
    );

    return {
        overlayLayers,
        areaLayers: areaLayerInfos,
        backgroundFileName: outBackgroundFileName,
        overlayDirName: overlayGroupDir,
        width: psd.image.width(),
        height: psd.image.height()
    };
}

