const os = require('os');
const path = require('path');
const sanitizeFilename = require("sanitize-filename");
const psdPath = require('./psdPath')

/**
 * @property fileName
 * @property name
 * @property left
 * @property top
 * @property {psdPath.Path} maskPath
 */
class LayerInfo {
    constructor(fileName, name, left, top, maskPath) {
        this.fileName = fileName;
        this.name = name;
        this.left = left;
        this.top = top;
        /** @var psdPath.Path */
        this.maskPath = maskPath;
    }
}

async function extractFromGroup(group, dirPath) {
    const layers = group.children().filter(layer => layer.type === 'layer');
    if (!checkNamesAreUnique(layers)) {
        return null;
    }

    const layerInfos = [];
    for (const layer of layers) {
        const vectorMask = layer.get('vectorMask');
        if (!vectorMask) {
            throw new Error(`Overlay layer ${layer.name} doesn't have vector mask`);
        }
        const fileName = sanitizeFilename(layer.name) + '.png';
        const layerInfo = new LayerInfo(
            fileName,
            layer.name,
            layer.left,
            layer.top,
            psdPath.parsePaths(vectorMask.export().paths)
        );
        process.stdout.write(`Extracting ${layer.name} layer to ${fileName}...`);
        await layer.layer.image.saveAsPng(path.join(dirPath, fileName));
        process.stdout.write('done' + os.EOL);
        layerInfos.push(layerInfo);
    }
    return layerInfos;
}

function checkNamesAreUnique(layers) {
    const names = new Set();
    for (const layer of layers) {
        if (names.has(layer.name)) {
            console.error(`Duplicated layer name: ${layer.name}`);
        }
        names.add(layer.name);
    }
    return names.size === layers.length;
}

exports.LayerInfo = LayerInfo;
exports.extractFromGroup = extractFromGroup;
