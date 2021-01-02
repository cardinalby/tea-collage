declare namespace generatedJson {

    type ShapeName = "poly"|"circle"|"rect";

    interface Area {
        shape: ShapeName,
        coords: number[],
        group: string,
        strokeColor?: string,
        fillColor?: string
    }
}