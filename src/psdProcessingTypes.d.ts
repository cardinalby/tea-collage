import {ImageMapperArea} from "./components/ImageMapper";

declare namespace generatedJson {

    interface CollageItem {
        fileName: string,
        left: number,
        top: number,
        width: number,
        height: number
    }

    interface BackgroundInfo {
        width: number;
        height: number;
        fileName: string;
    }

    interface CollageInfo {
        overlayItems: Object<string, CollageItem>;
        background: BackgroundInfo;
    }

    interface SourceSize {}


    type ImageMap = ImageMapperArea;
}

