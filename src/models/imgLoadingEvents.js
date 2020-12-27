import {useState} from "react";

class ImgEventHandlers {
    onLoad;
    onLoading;
    onError;
}

export default function ImgLoadingEvents() {
    const [loadingFull, setLoadingFull] = useState(new Set());
    const [loadingPreview, setLoadingPreview] = useState(new Set());

    const getLoading = preview => preview ? loadingPreview : loadingFull;
    const setLoading = (preview, img) => preview ? setLoadingPreview(img) : setLoadingFull(img);

    const addLoading = (component, preview) => {
        console.log('addloading', component, preview);
        const loading = getLoading(preview);
        if (!loading.has(component)) {
            loading.add(component);
            setLoading(preview, new Set(loading));
        }
    }

    const deleteLoading = (component, preview) => {
        console.log('deleteLoading', component, preview);
        const loading = getLoading(preview);
        if (loading.has(component)) {
            loading.delete(component);
            setLoading(preview, new Set(loading));
        }
    }

    return {
        eventHandlers: Object.assign(new ImgEventHandlers(), {
            onLoad: (target, preview, component) => {
                deleteLoading(component, preview);
                if (!preview) {
                    deleteLoading(component, true)
                }
            },
            onLoading: (target, preview, component) => addLoading(component, preview),
            onError: (target, preview, component) => deleteLoading(component, preview)
            }),
        isLoading: loadingFull.size > 0 || loadingPreview.size > 0,
        isPreview: loadingPreview.size > 0
    }
}