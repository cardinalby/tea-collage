declare namespace generatedJson {

    interface CollageOverlayPreviewItem {
        fileName: string
    }

    interface CollageBackgroundInfo {
        width: number;
        height: number;
        fileName: string;
    }

    interface CollageOverlayItem extends CollageOverlayPreviewItem, CollageBackgroundInfo {
        left: number,
        top: number
    }

    interface CollageInfo<Item> {
        overlayItems: Object<string, Item>;
        background: CollageBackgroundInfo;
    }

    type CollageFullInfo = CollageInfo<CollageOverlayItem>;
    type CollagePreviewInfo = CollageInfo<CollageOverlayPreviewItem>;
}

