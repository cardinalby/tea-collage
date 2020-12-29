import {useLayoutEffect, useState} from "react";

export interface Size {
    width: number,
    height: number
}

export function useElementSize(element: HTMLElement): Size {
    const [size, setSize] = useState<Size>({
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