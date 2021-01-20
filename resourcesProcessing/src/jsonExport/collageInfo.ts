import {PsdParsingResult} from "../psdParsing/psdParsingResult";
import CollageOverlayItem = generatedJson.CollageOverlayItem;
import CollageOverlayPreviewItem = generatedJson.CollageOverlayPreviewItem;
import CollageBackgroundInfo = generatedJson.CollageBackgroundInfo;
import CollageFullInfo = generatedJson.CollageFullInfo;

function getOverlayFullItems(
    psdResult: PsdParsingResult,
    excludeLayers: string[]
): {[name: string]: CollageOverlayItem}
{
    const layers = psdResult.overlayLayers.filter(layer => excludeLayers.indexOf(layer.name) === -1);
    return Object.fromEntries(layers.map(layer =>
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

function getOverlayPreviewItems(
    psdResult: PsdParsingResult,
    excludeLayers: string[]
): {[name: string]: CollageOverlayPreviewItem}
{
    const layers = psdResult.overlayLayers.filter(layer => excludeLayers.indexOf(layer.name) === -1);

    return Object.fromEntries(layers.map(layer =>
            [
                layer.name,
                { fileName: layer.fileName } as CollageOverlayPreviewItem
            ]
        )
    );
}

function createBackgroundInfo(psdResult: PsdParsingResult): CollageBackgroundInfo {
    return {
        width: psdResult.width,
        height: psdResult.height,
        fileName: psdResult.backgroundFileName
    };
}

export function createFullCollageInfo(psdResult: PsdParsingResult, excludeLayers: string[]): CollageFullInfo {
    return {
        overlayItems: getOverlayFullItems(psdResult, excludeLayers),
        background: createBackgroundInfo(psdResult)
    };
}

export function createPreviewCollageInfo(psdResult: PsdParsingResult, excludeLayers: string[]): CollageFullInfo {
    return {
        overlayItems: getOverlayPreviewItems(psdResult, excludeLayers),
        background: createBackgroundInfo(psdResult)
    };
}