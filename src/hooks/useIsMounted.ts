import {useEffect, useRef} from "react";

export function useIsMounted(): boolean {
    const componentIsMounted = useRef(true)
    useEffect(() => {
        return () => {
            componentIsMounted.current = false
        }
    }, []);
    return componentIsMounted.current;
}