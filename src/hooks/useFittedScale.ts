import {useElementSize} from "./useElementSize";

export function useFittedScale(
    container: HTMLElement,
    naturalWidth: number,
    naturalHeight: number
): number {
    const containerSize = useElementSize(container);

    const imgProportions = naturalWidth / naturalHeight;
    const parentProportions = containerSize.width / containerSize.height;

    return imgProportions < parentProportions
        ? containerSize.height / naturalHeight
        : containerSize.width / naturalWidth;
}
