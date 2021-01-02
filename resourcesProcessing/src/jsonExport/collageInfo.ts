import {PsdParsingResult} from "../psdParsing/psdParsingResult";
import CollageOverlayItem = generatedJson.CollageOverlayItem;
import CollageOverlayPreviewItem = generatedJson.CollageOverlayPreviewItem;
import CollageBackgroundInfo = generatedJson.CollageBackgroundInfo;
import CollageFullInfo = generatedJson.CollageFullInfo;

function getOverlayFullItems(psdResult: PsdParsingResult): {[name: string]: CollageOverlayItem} {
    return Object.fromEntries(psdResult.overlayLayers.map(layer =>
        [
            layer.name,
            {
                fileName: layer.fileName,
                left: layer.left,
                top: layer.top,
                width: layer.width,
                height: layer.height
            } as CollageOverlayItem
        ]
    ));
}

function getOverlayPreviewItems(psdResult: PsdParsingResult): {[name: string]: CollageOverlayPreviewItem} {
    return Object.fromEntries(psdResult.overlayLayers.map(layer =>
        [
            layer.name,
            { fileName: layer.fileName } as CollageOverlayPreviewItem
        ]
    ));
}

function createBackgroundInfo(psdResult: PsdParsingResult): CollageBackgroundInfo {
    return {
        width: psdResult.width,
        height: psdResult.height,
        fileName: psdResult.backgroundFileName
    };
}

export function createFullCollageInfo(psdResult: PsdParsingResult): CollageFullInfo {
    return {
        overlayItems: getOverlayFullItems(psdResult),
        background: createBackgroundInfo(psdResult)
    };
}

export function createPreviewCollageInfo(psdResult: PsdParsingResult): CollageFullInfo {
    return {
        overlayItems: getOverlayPreviewItems(psdResult),
        background: createBackgroundInfo(psdResult)
    };
}