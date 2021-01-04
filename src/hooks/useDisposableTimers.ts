import {useEffect, useRef} from "react";
import {DisposableTimers} from "../models/disposableTimers";

export function useDisposableTimers(): DisposableTimers {
    const disposableTimers = useRef<DisposableTimers>();
    if (!disposableTimers.current) {
        disposableTimers.current = new DisposableTimers();
    }
    useEffect(() => {
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            disposableTimers.current && disposableTimers.current.clear();
        }
    }, []);
    return disposableTimers.current;
}