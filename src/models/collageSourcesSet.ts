import {ImageMapperMap} from "../components/ImageMapper";
import {CollageSources} from "./collageSources";

const collageSizes: generatedJson.CollageSizeDef[] = require('../collage-info/sizes.json');
const areasMap: generatedJson.Area[] = require('../collage-info/areas-map.json');

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

    public readonly collageAspectRatio = collageSizes[0].width / collageSizes[0].height;

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