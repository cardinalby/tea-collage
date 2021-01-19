const photosInfo: generatedJson.PhotosInfo = require('../collage-info/photos-info.json');

const photosDirUrl = process.env.PUBLIC_URL + '/tea_photos';

function getDirUrl(preview: boolean): string {
    return preview
        ? photosDirUrl + '/' + photosInfo.previewsDirName
        : photosDirUrl;
}

class PhotosSources {
    // noinspection JSUnusedGlobalSymbols
    public getPhotoUrl(fileName: string, preview: boolean = false): string|undefined {
        if (!photosInfo.files.find(file => file === fileName)) {
            return undefined;
        }
        return getDirUrl(preview) + '/' + fileName;
    }

    public getTeaPhotoUrl(teaName: string, preview: boolean = false): string|undefined {
        if (!photosInfo.teas.hasOwnProperty(teaName)) {
            return undefined;
        }
        const fileIndex = photosInfo.teas[teaName];
        if (fileIndex >= photosInfo.files.length) {
            return undefined;
        }
        const fileName = photosInfo.files[photosInfo.teas[teaName]];

        return getDirUrl(preview) + '/' + fileName;
    }
}

export default new PhotosSources();