import {resizeFile} from "./resizing";
import * as fs from 'fs-extra';
import path from "path";
const processingConfig = require('../../resources/processing-config.json');

export async function makePhotosPreviews(
    sourcesDir: string,
    destDir: string,
    skipImagesSaving: boolean
): Promise<string[]> {
    const files = (await fs.readdir(sourcesDir, {withFileTypes: true}))
        .filter(item => item.isFile())
        .map(item => item.name);

    if (skipImagesSaving) {
        return Promise.resolve(files.map(fileName => path.join(destDir, fileName)));
    }

    const resizing = files.map(fileName => resizeFile(
            path.join(sourcesDir, fileName),
            destDir,
            { width: processingConfig.photosPreviews.width, height: processingConfig.photosPreviews.height },
            "jpg",
            { grayscale: true, quality: 50 }            
        ));

    return await Promise.all(resizing);
}