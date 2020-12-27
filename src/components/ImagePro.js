import React, {Component} from "react";
import PropTypes from "prop-types";

/**
 * @property {HTMLImageElement} image
 */
export class ImagePro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: props.previewSrc,
            loading: true,
            srcSetData: { srcSet: '', sizes: '' }
        };
        this.selfProps = {
            delay: true,
            imgRef: true,
            onError: true,
            onLoad: true,
            onLoading: true,
            onProgress: true,
            src: true,
            previewSrc: true,
            srcSetData: true
        }
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
        if (this.image) {
            this.image.onload = null;
            this.image.onerror = null;
        }
    }

    loadImage = (src, srcSetData) => {
        // If there is already an image we nullify the onload
        // and onerror props so it does not incorrectly set state
        // when it resolves
        if (this.image) {
            this.image.onload = null;
            this.image.onerror = null;
        }
        const image = new Image();
        this.image = image;
        image.onload = this.onLoad;
        image.onerror = this.onError;
        image.src = src;
        if (srcSetData) {
            image.srcset = srcSetData.srcSet;
            image.sizes = srcSetData.sizes;
        }
        if (this.props.onLoading) {
            this.props.onLoading(image, false, this);
        }
    };
    
    onLoad = (event) => {
        // use this.image.src instead of this.props.src to
        // avoid the possibility of props being updated and the
        // new image loading before the new props are available as
        // this.props.
    
        if (this.props.delay) {
            this.setImageWithDelay(event);
        } else {
            this.setImage(event);
        }
    };
    
    setImageWithDelay = (loadedEvent) => {
        setTimeout(() => {
            this.setImage(loadedEvent);
        }, this.props.delay);
    };
    
    setImage = (loadedEvent) => {
        this.setState({
            image: this.image.src,
            loading: false,
            srcSetData: {
                srcSet: this.image.srcset || '',
                sizes: this.image.sizes || ''
            }
        });
        if (this.props.onLoad) {
            this.props.onLoad(loadedEvent.target, false, this)
        }
    };
    
    onError = (errorEvent) => {
        const { onError } = this.props;
        if (onError) {
            onError(errorEvent, false);
        }
    };

    onInternalImgLoad = event => {
        if (this.props.onLoad && this.state.loading) {
            this.props.onLoad(event.target, true, this);
        }
    }

    onInternalImgError = event => {
        if (this.props.onError && this.state.loading) {
            this.props.onError(event, true, this);
        }
    }

    onInternalImgRef = node => {
        if (this.props.imgRef) {
            this.props.imgRef(node)
        }
        if (this.props.onLoading && this.state.loading) {
            this.props.onLoading(node, true, this);
        }
    }

    extractImgProps() {
        return Object.fromEntries(
            Object.keys(this.props)
                .filter(key => !this.selfProps[key])
                .map(key => [key, this.props[key]])
        );
    }
    
    render() {
        const { image, loading, srcSetData } = this.state;
        const imgProps = this.extractImgProps();

        return <img
            src={image}
            srcSet={srcSetData.srcSet}
            sizes={srcSetData.sizes}
            ref={this.onInternalImgRef}
            alt={imgProps.alt}
            onLoad={this.onInternalImgLoad}
            onError={this.onInternalImgError}
            {...imgProps}
        />
    }
}

ImagePro.propTypes = {
    imgRef: PropTypes.any,
    delay: PropTypes.number,
    onError: PropTypes.func,
    onLoad: PropTypes.func,
    onLoading: PropTypes.func,
    src: PropTypes.string.isRequired,
    previewSrc: PropTypes.string,
    srcSetData: PropTypes.shape({
        srcSet: PropTypes.string,
        sizes: PropTypes.string
    }),
};