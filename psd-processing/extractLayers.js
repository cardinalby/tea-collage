const os = require('os');
const path = require('path');
const sanitizeFilename = require("sanitize-filename");
const psdPath = require('./psdPath')

/**
 * @property fileName
 * @property name
 * @property left
 * @property top
 * @property width
 * @property height
 * @property {psdPath.Path} maskPath
 */
class LayerInfo {
    constructor(fileName, name, left, top, width, height, maskPath) {
        this.fileName = fileName;
        this.name = name;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        /** @var psdPath.Path */
        this.maskPath = maskPath;
    }

    copy() {
        return Object.assign(new LayerInfo(), this, {
            maskPath: this.maskPath && this.maskPath.copy()
        });
    }
}

async function extractFromGroup(group, extractionDir, groupDir) {
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
            path.join(groupDir, fileName),
            layer.name,
            layer.left,
            layer.top,
            layer.width,
            layer.height,
            psdPath.parsePaths(vectorMask.export().paths)
        );

        process.stdout.write(`Extracting ${layer.name} layer to ${layerInfo.fileName}...`);
        await layer.layer.image.saveAsPng(path.join(extractionDir, layerInfo.fileName));
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
