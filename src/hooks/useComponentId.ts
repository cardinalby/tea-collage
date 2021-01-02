import {useState} from "react";

let counter = 1;
export function useComponentId(providedId: string|undefined, name: string) {
    return useState(providedId || Symbol(name + '_' + counter++))[0];
}