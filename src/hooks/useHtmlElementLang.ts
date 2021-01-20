import {useEffect, useRef} from "react";

export function useHtmlElementLang(lang: string) {
    const oldLang = useRef<string|undefined>();

    useEffect(() => {
        oldLang.current = document.title;
        document.documentElement.lang = lang;
        return () => {
            document.documentElement.lang = oldLang.current || '';
        }
    }, [lang]);
}