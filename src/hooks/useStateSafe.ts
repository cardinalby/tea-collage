import {Dispatch, SetStateAction, useState} from "react";
import {useIsMounted} from "./useIsMounted";

export function useStateSafe<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
    const isMounted = useIsMounted();
    const [state, setState] = useState(initialState);

    return [
        state,
        value => { if (isMounted) {
            setState(value);
        }}
        ];
}