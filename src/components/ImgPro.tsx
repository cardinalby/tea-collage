import React, {Component, RefCallback} from "react";
import isEqual from "react-fast-compare";
import {ImgProLoadEvents, ImgProLoadEventsWrapper} from "./ImgPro/ImgProLoadEvents";

export type ImgProEventHandler = (target: HTMLImageElement, preview: boolean, component: ImgPro) => void;



export interface ImgProProps {
    delay?: boolean,
    imgRef?: RefCallback<HTMLImageElement>,
    src: string,
    previewSrc: string,
    srcSetData?: { sizes: string, srcSet: string },
    imgProps: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
    loadEvents?: ImgProLoadEvents
}

interface ImgProState {
    image?: string,
    loading: boolean,
    srcSetData: { srcSet: string, sizes: string }
}

export class ImgPro extends Component<ImgProProps, ImgProState> {
    hiddenImage?: HTMLImageElement;
    renderedImage?: HTMLImageElement;
    loadEvents = new ImgProLoadEventsWrapper();
    willUnmount: boolean = false;
    
    public constructor(props: ImgProProps) {
        super(props);
        this.state = {
            image: props.previewSrc,
            loading: true,
            srcSetData: { srcSet: '', sizes: '' }
        };
    }

    componentDidMount() {
        const { src, srcSetData } = this.props;
        this.loadImage(src, srcSetData);
    }

    componentDidUpdate(prevProps) {
        const { src, previewSrc, srcSetData } = this.props;
        // We only invalidate the current image if the src has changed.
        if (src !== prevProps.src) {
            this.setState({ image: previewSrc, loading: true }, () => {
                this.loadImage(src, srcSetData);
            });
        }
    }

    componentWillUnmount() {
        if (this.hiddenImage) {
            this.hiddenImage.onload = null;
            this.hiddenImage.onerror = null;
        }
        if (this.hiddenImage) {
            this.loadEvents.onError(this.hiddenImage, false, this);
        }
        if (this.state.loading && this.renderedImage) {
            this.loadEvents.onError(this.renderedImage, true, this);
        }
        this.willUnmount = true;
    }

    protected loadImage = (src, srcSetData) => {
        // If there is already an image we nullify the onload
        // and onerror props so it does not incorrectly set state
        // when it resolves
        if (this.hiddenImage) {
            this.hiddenImage.onload = null;
            this.hiddenImage.onerror = null;
        }
        const image = new Image();
        this.hiddenImage = image;
        image.onload = this.onLoad;
        image.onerror = this.onError;
        image.src = src;
        if (srcSetData) {
            image.srcset = srcSetData.srcSet;
            image.sizes = srcSetData.sizes;
        }
        this.loadEvents.onLoading(image, false, this);
    };

    protected onLoad = (event) => {
        // use this.image.src instead of this.props.src to
        // avoid the possibility of props being updated and the
        // new image loading before the new props are available as
        // this.props.
        if (this.props.delay) {
            this.setImageWithDelay(event, this.props.delay);
        } else {
            this.setImage(event);
        }
    };

    protected setImageWithDelay = (loadedEvent, delay) => {
        setTimeout(() => {
            this.setImage(loadedEvent);
        }, delay);
    };

    protected setImage = (loadedEvent) => {
        this.setState({
            image: loadedEvent.target.src,
            loading: false,
            srcSetData: {
                srcSet: loadedEvent.target.srcset || '',
                sizes: loadedEvent.target.sizes || ''
            }
        });
        this.loadEvents.onLoad(loadedEvent.target, false, this);
    };

    protected onError = (errorEvent) => {
        this.loadEvents.onError(errorEvent, false, this);
    };

    protected onInternalImgLoad = event => {
        if (this.state.loading) {
            this.loadEvents.onLoad(event.target, true, this);
        }
    }

    protected onInternalImgError = event => {
        if (this.state.loading) {
            this.loadEvents.onError(event, true, this);
        }
    }

    protected onInternalImgRef = node => {
        this.renderedImage = node;
        if (this.props.imgRef) {
            this.props.imgRef(node)
        }
        if (this.state.loading && !this.willUnmount) {
            this.loadEvents.onLoading(node, true, this);
        }
    }
    
    render() {
        const { image, srcSetData } = this.state;
        this.loadEvents = new ImgProLoadEventsWrapper(this.props.loadEvents);

        return <img
            src={image}
            srcSet={srcSetData.srcSet}
            sizes={srcSetData.sizes}
            ref={this.onInternalImgRef}
            onLoad={this.onInternalImgLoad}
            onError={this.onInternalImgError}
            alt={this.props.imgProps.alt}
            {...this.props.imgProps}
        />
    }
}