declare namespace generatedJson {

    interface PhotosInfo {
        previewsDirName: string;
        files: string[],
        teas: {
            [teaName: string]: number; // index in files array
        }
    }

}