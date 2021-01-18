declare namespace resourcesConfig {

    interface ImgAreaConfig {
        fillColor: string;
        strokeColor: string;
        lineWidth?: number;
    }

    type ImgAreasConfig = Object<string, ImgAreaConfig>;

}