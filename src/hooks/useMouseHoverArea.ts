import {useRef, useState} from "react";
import {ImageMapperArea} from "../components/ImageMapper";
import {useDisposableTimers} from "./useDisposableTimers";

export interface MouseHoverArea {
    hoverAreaGroup: string|undefined,
    preloadGroup: string|undefined,
    onMouseEnterArea: (area: ImageMapperArea) => void;
    onMouseLeaveArea: (area: ImageMapperArea) => void;
}

export function useMouseHoverArea(startPreloadAfterMs: number, stopPreloadAfterMs?: number): MouseHoverArea {
    const hoverAreaGroup = useRef<string>();
    const [preloadGroup, setPreloadGroup] = useState<string|undefined>();
    const disposableTimers = useDisposableTimers();

    function onMouseEnterArea(area: ImageMapperArea) {
        hoverAreaGroup.current = area.group;
        if (startPreloadAfterMs !== undefined) {
            disposableTimers.setTimeout(() => {
                if (hoverAreaGroup.current === area.group) {
                    setPreloadGroup(area.group);
                }
            }, startPreloadAfterMs);
        }
    }
    function onMouseLeaveArea(area: ImageMapperArea) {
        if (hoverAreaGroup.current === area.group) {
            hoverAreaGroup.current = undefined;
        }
        if (stopPreloadAfterMs !== undefined) {
            disposableTimers.setTimeout(() => {
                if (hoverAreaGroup.current !== area.group) {
                    setPreloadGroup(undefined);
                }
            }, 1000);
        }
    }

    return {
        hoverAreaGroup: hoverAreaGroup.current,
        preloadGroup,
        onMouseEnterArea,
        onMouseLeaveArea
    };
}