import {CollageSources} from "../models/collageSourcesSet";
import {useRef} from "react";

/**
 * true: all
 * false: none
 * string or string[]: listed items only
 */
type ItemIds = boolean|string|string[];

function collectUrls(sources: CollageSources, preview: boolean, items: ItemIds): string[] {
    if (items === false) {
        return [];
    }
    if (typeof items === 'string') {
        items = [items];
    }
    return Object
        .keys(sources.getCollageInfo(preview).overlayItems)
        .filter(itemId => (items === true || (items as string[]).indexOf(itemId) >= 0))
        .map(itemId => sources.getOverlayUrl(itemId, preview))
}

export function useOverlayImagesPreloader (
    sources: CollageSources,
    loadPreview: ItemIds,
    loadFull: ItemIds,
) {
    const images = useRef(new Map<string, HTMLImageElement>());
    const requiredUrls = collectUrls(sources, true, loadPreview).concat(
        collectUrls(sources, false, loadFull)
    );
    const requiredUrlsMap = new Map(requiredUrls.map(url => [url, true]));
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
        images.current.set(requiredUrl, image);
    }
}