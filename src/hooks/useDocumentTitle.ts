import {useEffect, useRef} from "react";

export function useDocumentTitle(title) {
    const oldTitle = useRef<string|undefined>();

    useEffect(() => {
        oldTitle.current = document.title;
        document.title = title;
        return () => {
            document.title = oldTitle.current || '';
        }
    }, [title]);
}