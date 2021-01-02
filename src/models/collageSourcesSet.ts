import {ImageMapperMap} from "../components/ImageMapper";

const collageSizes: generatedJson.CollageSizeDef[] = require('../collage-info/sizes.json');
const areasMap: generatedJson.Area[] = require('../collage-info/areas-map.json');
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
        public readonly full: generatedJson.CollageFullInfo,
        public readonly previewName: string,
        public readonly preview: generatedJson.CollagePreviewInfo
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

    public getCollageInfo(preview: boolean): generatedJson.CollageFullInfo|generatedJson.CollagePreviewInfo {
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

class CollageSourcesSet {
    public readonly sizesMap: Map<string, generatedJson.CollageSizeDef>;
    public readonly previewSize: generatedJson.CollageSizeDef;

    public constructor() {
        collageSizes.sort((a, b) => a.width - b.width);
        this.sizesMap = new Map<string, generatedJson.CollageSizeDef>(
            collageSizes
                .filter(size => !size.preview)
                .map(size => [
                    size.name,
                    size
                ])
        );
        this.previewSize =
            collageSizes.find(size => size.preview) ||
            collageSizes[0];
    }

    // noinspection JSUnusedGlobalSymbols
    public getSizes(): generatedJson.CollageSizeDef[] {
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

    public getAreasMap(mapName: string = 'collage'): ImageMapperMap {
        return {
            name: mapName,
            areas: areasMap
        };
    }
}

export default new CollageSourcesSet();