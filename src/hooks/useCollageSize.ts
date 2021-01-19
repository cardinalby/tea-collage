import {useStateSafe} from "./useStateSafe";
import collageSourcesSet from "../models/collageSourcesSet";
import {getRecommendedCollageSize} from "../models/sizeAutoSelector";

const STORAGE_SIZE_PREF_KEY = 'collage_size';

export function useCollageSize(): [string, (newSize: string) => void] {
    const [size, setSize] = useStateSafe(() => {
        const prefSize = sessionStorage.getItem(STORAGE_SIZE_PREF_KEY);
        if (prefSize) {
            return prefSize;
        }
        const recommendedSize = getRecommendedCollageSize(collageSourcesSet.getSizes());
        sessionStorage.setItem(STORAGE_SIZE_PREF_KEY, recommendedSize);
        return recommendedSize;
    })

    return [
        size,
        (size: string) => {
            sessionStorage.setItem(STORAGE_SIZE_PREF_KEY, size);
            setSize(size);
        }
    ];
}