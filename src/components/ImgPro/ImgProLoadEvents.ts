import {ImgProEventHandler} from "../ImgPro";

export interface ImgProLoadEvents {
    onError?: ImgProEventHandler,
    onLoad?: ImgProEventHandler,
    onLoading?: ImgProEventHandler
}

export class ImgProLoadEventsWrapper implements ImgProLoadEvents {
    public constructor(
        public events?: ImgProLoadEvents|undefined,
    ) {}

    onError: ImgProEventHandler = (...args) => 
        this.events?.onError && this.events.onError(...args);

    onLoad: ImgProEventHandler = (...args) =>
        this.events?.onLoad && this.events.onLoad(...args);

    onLoading: ImgProEventHandler = (...args) =>
        this.events?.onLoading && this.events.onLoading(...args);
}