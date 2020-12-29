import {CollageSources} from "../models/collageSourcesSet";
import {useRef} from "react";

/**
 * true: all
 * false: none
 * string or string[]: listed items only
 */
type ItemIds = boolean|string|string[];

function collectUrls(
    sources: CollageSources, preview: boolean, items: ItemIds
): { url: string, itemId: string }[] {
    if (items === false) {
        return [];
    }
    if (typeof items === 'string') {
        items = [items];
    }
    return Object
        .keys(sources.getCollageInfo(preview).overlayItems)
        .filter(itemId => (items === true || (items as string[]).indexOf(itemId) >= 0))
        .map(itemId => ({
            url: sources.getOverlayUrl(itemId, preview),
            itemId: itemId
        }))
}

export function useOverlayImagesPreloader (
    sources: CollageSources,
    loadPreview: ItemIds,
    loadFull: ItemIds,
    onLoad?: (target: HTMLImageElement, id: string, preview: boolean) => void
) {
    const images = useRef(new Map<string, HTMLImageElement>());

    const requiredItems = ([] as [string, { preview: boolean, itemId: string }][]).concat(
        collectUrls(sources, true, loadPreview).map(entry => [
            entry.url,
            { preview: true, itemId: entry.itemId }
        ]),
        collectUrls(sources, false, loadFull).map(entry => [
            entry.url,
            { preview: false, itemId: entry.itemId }
        ]),
    );
    const requiredUrlsMap = new Map(requiredItems);
    for (const existingUrl of images.current.keys()) {
        if (requiredUrlsMap.has(existingUrl)) {
            requiredUrlsMap.delete(existingUrl);
        } else {
            images.current.delete(existingUrl);
        }
    }
    for (const requiredUrl of requiredUrlsMap.keys()) {
        const image = new Image();
        image.src = requiredUrl;
        if (onLoad) {
            const itemInfo = requiredUrlsMap.get(requiredUrl);
            itemInfo && (image.onload = () => onLoad(image, itemInfo.itemId, itemInfo.preview))
        }
        images.current.set(requiredUrl, image);
    }
}