/** @type {array} */
const collageSizes = require('../collage-info/sizes.json');
const extractedDir = process.env.PUBLIC_URL + '/extracted';

/**
 * @property {CollageInfo} preview
 * @property {CollageInfo} full
 */
class CollageSources {
    constructor(fullName, fullInfo, previewName, previewInfo) {
        this.fullName = fullName;
        this.full = fullInfo;
        this.preview = previewInfo;
        this.previewName = previewName;
    }

    getBackgroundUrl(preview) {
        const info = this._getInfo(preview);
        return `${extractedDir}/${info.dir}/${info.collage.background.fileName}`;
    }

    getOverlayUrl(id, preview) {
        const info = this._getInfo(preview);
        const overlayItem = info.collage.overlayItems[id];
        return overlayItem && `${extractedDir}/${info.dir}/${overlayItem.fileName}`;
    }

    /**
     * @return {CollageItem}
     */
    getOverlayItem(id) {
        return this.full.overlayItems[id];
    }

    /**
     * @param preview
     * @return {{collage: (CollageInfo), dir: (string)}}
     * @private
     */
    _getInfo(preview) {
        return {
            dir: preview ? this.previewName : this.fullName,
            collage: preview ? this.preview : this.full
        }
    }
}

class SizeOption {
    constructor(name, width, height) {
        this.name = name;
        this.width = width;
        this.height = height;
    }
}

class CollageSourcesSet {
    constructor() {
        collageSizes.sort((a, b) => a.width - b.width);
        this.sizesMap = new Map(
            collageSizes
                .filter(size => !size.preview)
                .map(size => [
                    size.name,
                    new SizeOption(size.name, size.width, size.height)
                ])
        );
        this.previewSize =
            collageSizes.find(size => size.preview) ||
            collageSizes[0]
        ;
    }

    /**
     * @return {SizeOption[]}
     */
    getSizes() {
        return Array.from(this.sizesMap.values());
    }

    /**
     * @return {CollageSources}
     */
    getSources(setName) {
        if (this.sizesMap.has(setName)) {
            return new CollageSources(
                setName,
                require(`../collage-info/${setName}.json`),
                this.previewSize.name,
                require(`../collage-info/${this.previewSize.name}.json`),
            )
        }
    }
}

export default new CollageSourcesSet();