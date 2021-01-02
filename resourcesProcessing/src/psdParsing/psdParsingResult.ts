export interface OverlayLayerInfo {
    fileName: string,
    name: string,
    left: number,
    top: number,
    width: number,
    height: number
}

function copyOverlayLayerInfo(layerInfo: OverlayLayerInfo): OverlayLayerInfo {
    return {...layerInfo};
}

export interface SubpathPoint {
    x: number,
    y: number,
}

export type SubPath = SubpathPoint[];
export type Path = SubPath[];

export interface AreaLayerInfo {
    name: string,
    path: Path
}

function copyAreaLayerInfo(areaLayerInfo: AreaLayerInfo): AreaLayerInfo {
    return {
        name: areaLayerInfo.name,
        path: areaLayerInfo.path.map(subPath => subPath.map(point => ({...point})))
    };
}

export interface PsdParsingResult {
    overlayLayers: OverlayLayerInfo[];
    areaLayers: AreaLayerInfo[];
    backgroundFileName: string;
    overlayDirName: string;
    width: number;
    height: number;
}

export function copyPsdParsingResult(psdParsingResult: PsdParsingResult): PsdParsingResult {
    return {
        ...psdParsingResult,
        overlayLayers: psdParsingResult.overlayLayers.map(copyOverlayLayerInfo),
        areaLayers: psdParsingResult.areaLayers.map(copyAreaLayerInfo)
    }
}