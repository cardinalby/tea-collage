const os = require('os');
const psdPath = require('./psdPath');
const workerThreads = require('node-worker-threads-pool');

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

    /**
     * @param {object} obj
     * @return LayerInfo
     */
    static deserialize(obj) {
        return Object.assign(new LayerInfo(), obj, {
            maskPath: obj.maskPath && psdPath.Path.deserialize(obj.maskPath)
        });
    }

    copy() {
        return Object.assign(new LayerInfo(), this, {
            maskPath: this.maskPath && this.maskPath.copy()
        });
    }
}

async function extractFromGroup(group, extractionDir, groupDir, psdFilePath) {
    const layers = group.children().filter(layer => layer.type === 'layer');
    if (!checkNamesAreUnique(layers)) {
        return null;
    }

    const staticPool = new workerThreads.StaticPool({
        size: os.cpus().length,
        task: './psd-processing/workerTasks/layerExtracting.js'
    });
    const tasks = layers.map(layer =>
        staticPool
            .exec({
                psdFilePath: psdFilePath,
                layerPath: group.name + '/' + layer.name,
                extractionDir: extractionDir,
                groupDir: groupDir
            })
            .then(result => {
                if (typeof result === 'string') {
                    throw new Error(result);
                }
                return LayerInfo.deserialize(result)
            })
    )

    try {
        return await Promise.all(tasks);
    }
    catch (e) {
        console.error('Extracting process finished with ' + e.toString())
        process.exit(0);
    }
    finally {
        await staticPool.destroy();
    }
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
