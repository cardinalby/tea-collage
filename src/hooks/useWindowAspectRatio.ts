import {useLayoutEffect} from "react";

export interface AspectRatioClasses {
    // className will be set to element if callback returns true
    [className: string]: (aspectRatio: number) => boolean
}

export function useWindowAspectRatioClass(element: HTMLElement, classes: AspectRatioClasses) {
    useLayoutEffect(() => {
        function updateAspectRatio() {
            let aspectRatio = window.innerWidth / window.innerHeight;
            for (const className in classes) {
                if (classes.hasOwnProperty(className)) {
                    element.classList.toggle(className, classes[className](aspectRatio));
                }
            }
        }
        window.addEventListener('resize', updateAspectRatio);
        updateAspectRatio();
        return () => window.removeEventListener('resize', updateAspectRatio);
    }, [element, classes]);
}