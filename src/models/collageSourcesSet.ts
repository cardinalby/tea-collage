import {generatedJson} from "../psdProcessingTypes";
import {ImageMapperMap} from "../components/ImageMapper";

type CollageInfo = generatedJson.CollageInfo;

const collageSizes = require('../collage-info/sizes.json');
const areasMap = require('../collage-info/areas-map.json');
const extractedDir = process.env.PUBLIC_URL + '/extracted';

/**
 * @property left
 * @property top
 * @property width
 * @property height
 */
export class OverlayDimensions {
    public constructor(
        readonly left: number,
        readonly top: number,
        readonly width: number,
        readonly height: number
    ) {}

    public scale(scale: number): OverlayDimensions {
        return new OverlayDimensions(
            this.left * scale,
            this.top * scale,
            this.width * scale,
            this.height * scale
        )
    }
}

export class CollageSources {
    public constructor(
        public readonly fullName: string,
        public readonly full: CollageInfo,
        public readonly previewName: string,
        public readonly preview: CollageInfo
    ) {}

    public getBackgroundUrl(preview: boolean = false): string {
        const info = this._getInfo(preview);
        return `${extractedDir}/${info.dir}/${info.collage.background.fileName}`;
    }

    public getOverlayUrl(id: string, preview: boolean = false): string {
        const info = this._getInfo(preview);
        const overlayItem = info.collage.overlayItems[id];
        return overlayItem && `${extractedDir}/${info.dir}/${overlayItem.fileName}`;
    }

    public getOverlayDimensions(id: string, preview: boolean = false): OverlayDimensions {
        const collageItem = this.getCollageInfo(preview).overlayItems[id];
        return collageItem && new OverlayDimensions(
            collageItem.left,
            collageItem.top,
            collageItem.width,
            collageItem.height
        );
    }

    public getCollageInfo(preview: boolean): CollageInfo {
        return preview ? this.preview : this.full;
    }

    /**
     * @param preview
     * @return {{collage: (CollageInfo), dir: (string)}}
     * @private
     */
    _getInfo(preview: boolean) {
        return {
            dir: preview ? this.previewName : this.fullName,
            collage: this.getCollageInfo(preview)
        }
    }
}

class SizeOption {
    constructor(
        public readonly name: string,
        public readonly width: number,
        public readonly height: number
    ) {}
}

class CollageSourcesSet {
    public readonly sizesMap: any;
    public readonly previewSize: any;

    public constructor() {
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
            collageSizes[0];
    }

    // noinspection JSUnusedGlobalSymbols
    public getSizes(): SizeOption[] {
        return Array.from(this.sizesMap.values());
    }

    public getSources(setName: string): CollageSources {
        if (this.sizesMap.has(setName)) {
            return new CollageSources(
                setName,
                require(`../collage-info/${setName}.json`),
                this.previewSize.name,
                require(`../collage-info/${this.previewSize.name}.json`),
            )
        }
        throw new Error('invalid setName = ' + setName);
    }

    public getAreasMap(): ImageMapperMap {
        return areasMap;
    }
}

export default new CollageSourcesSet();