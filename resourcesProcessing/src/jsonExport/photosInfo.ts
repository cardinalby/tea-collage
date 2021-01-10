const sanitizeFilename = require("sanitize-filename");

export function createPhotosInfo(
    fileNames: string[],
    teasNames: string[],
    previewsDirName: string
): generatedJson.PhotosInfo {
    const teas = {};
    teasNames.forEach(name => {
        const expectedFileName = sanitizeFilename(name) + '.jpg';
        const fileIndex = fileNames.indexOf(expectedFileName);
        if (fileIndex !== -1) {
            teas[name] = fileIndex;
        }
    });

    return {
        files: fileNames,
        previewsDirName,
        teas
    }
}