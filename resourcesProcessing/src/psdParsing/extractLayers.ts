import {OverlayLayerInfo} from "./psdParsingResult";

const os = require('os');
const workerThreads = require('node-worker-threads-pool');

export async function extractFromGroup(
    group: any,
    extractionDir: string,
    groupDir: string,
    psdFilePath: string,
    checkOnly: boolean,
): Promise<OverlayLayerInfo[]>
{
    const layers = group.children().filter(layer => layer.type === 'layer');
    checkNamesAreUnique(layers);
    if (checkOnly) {
        return [];
    }

    console.log(`Extracting overlay layers in ${os.cpus().length} threads...`);
    const staticPool = new workerThreads.StaticPool({
        size: os.cpus().length,
        task: './resourcesProcessing/build/psdParsing/layerExtractingThread.js'
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
                return result
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

export function checkNamesAreUnique(layers): void {
    const names = new Set();
    for (const layer of layers) {
        if (names.has(layer.name)) {
            console.error(`Duplicated layer name in group: ${layer.name}`);
        }
        names.add(layer.name);
    }
    if (names.size !== layers.length) {
        throw new Error('Group has duplicated layer names');
    }
}
