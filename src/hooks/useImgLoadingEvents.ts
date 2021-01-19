import {useState} from "react";

export interface ImgProEventHandlers {
    onLoad: (target, preview, component) => void;
    onLoading: (target, preview, component) => void;
    onError: (target, preview, component) => void;
    onHidden: (component) => void;
}

export interface ImgProLoadingEvents {
    eventHandlers: ImgProEventHandlers;
    isLoading: boolean;
    isPreview: boolean;
}

export default function useImgLoadingEvents(): ImgProLoadingEvents {
    const [loadingFull, setLoadingFull] = useState(new Set());
    const [loadingPreview, setLoadingPreview] = useState(new Set());

    const getLoading = preview => preview ? loadingPreview : loadingFull;
    const setLoading = (preview, img) => preview ? setLoadingPreview(img) : setLoadingFull(img);

    const addLoading = (component, preview) => {
        const loading = getLoading(preview);
        if (!loading.has(component)) {
            loading.add(component);
            setLoading(preview, new Set(loading));
        }
    }

    const deleteLoading = (component, preview) => {
        const loading = getLoading(preview);
        if (loading.has(component)) {
            loading.delete(component);
            setLoading(preview, new Set(loading));
        }
    }

    return {
        eventHandlers: {
            onLoad: (target, preview, component) => {
                deleteLoading(component, preview);
                if (!preview) {
                    deleteLoading(component, true)
                }
            },
            onLoading: (target, preview, component) => addLoading(component, preview),
            onError: (target, preview, component) => {
                deleteLoading(component, preview);
            },
            onHidden: component => {
                deleteLoading(component, false);
                deleteLoading(component, true);
            }
            },
        isLoading: loadingFull.size > 0 || loadingPreview.size > 0,
        isPreview: loadingPreview.size > 0
    }
}