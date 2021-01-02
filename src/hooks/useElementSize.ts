import {useLayoutEffect, useState} from "react";
import {Size2d} from "../models/point2d";

export function useElementSize(element: HTMLElement): Size2d {
    const [size, setSize] = useState<Size2d>({
        width: element.clientWidth,
        height: element.clientHeight
    });
    useLayoutEffect(() => {
        function updateSize() {
            setSize({
                width: element.clientWidth,
                height: element.clientHeight
            });
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, [element]);
    return size;
}