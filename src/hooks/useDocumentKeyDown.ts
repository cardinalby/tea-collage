import {useEffect} from "react";

export function useDocumentKeyDown(listener: (event: KeyboardEvent) => any) {
    useEffect(() => {
        document.addEventListener("keydown", listener, false);

        return () => {
            document.removeEventListener("keydown", listener, false);
        };
    }, [listener]);
}