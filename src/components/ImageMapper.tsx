import React, {Component, CSSProperties, MouseEventHandler} from "react";
import isEqual from "react-fast-compare";
import memoize from "memoize-one";
import {ImgPro} from "./ImgPro";
import {ImgProLoadEvents, ImgProLoadEventsWrapper} from "./ImgPro/ImgProLoadEvents";

export type ImageMapperMouseEvent = (
    area: ImageMapperArea,
    index: number,
    event: MouseEventHandler<HTMLAreaElement>
) => void

export interface ImageMapperArea {
    _id?: string,
    group?: string,
    coords: number[],
    href?: string,
    shape: ShapeName,
    preFillColor?: string,
    fillColor?: string,
    lineWidth?: number,
    strokeColor?: string
}

export interface ImageMapperMap {
    areas: ImageMapperArea[],
    name: string
}

export interface ImageMapperSizeProps {
    width: number,
    height: number,
}

export interface ImageMapperStyleProps {
    fillColor?: string,
    strokeColor?: string
    lineWidth?: number,
}

export interface ImageMapperSourceProps {
    imgWidth: number,
    src: string,
    previewSrc: string,
    map: ImageMapperMap
}

export interface ImageMapperBehaviorProps {
    active?: boolean,
    onClick?: ImageMapperMouseEvent,
    onMouseMove?: ImageMapperMouseEvent,
    onImageClick?: MouseEventHandler<HTMLImageElement>,
    loadEvents: ImgProLoadEvents,
    onMouseEnter?: ImageMapperMouseEvent,
    onMouseLeave?: ImageMapperMouseEvent,
}

export interface ImageMapperProps extends
    ImageMapperSizeProps,
    ImageMapperStyleProps,
    ImageMapperSourceProps,
    ImageMapperBehaviorProps
{}

interface ImageMapperState {
    map: ImageMapperMap
}

type ShapeName = 'poly'|'circle'|'rect';

type DrawMethod = (
    ctx: CanvasRenderingContext2D,
    coords: number[],
    fillColor: string,
    lineWidth: number,
    strokeColor: string
) => void;

const watchedProps = [
    "active",
    "fillColor",
    "height",
    "imgWidth",
    "imgHeight",
    "lineWidth",
    "src",
    "strokeColor",
    "width"
];

export default class ImageMapper extends Component<ImageMapperProps, ImageMapperState> {

    static defaultProps = {
        active: true,
        fillColor: "rgba(255, 255, 255, 0.5)",
        lineWidth: 1,
        map: {
            areas: [],
            name: "image-map-" + Math.random()
        },
        strokeColor: "rgba(0, 0, 0, 0.5)"
    };

    styles = {
        container: { position: "relative" } as CSSProperties,
        canvas: {
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 2
        } as CSSProperties,
        img: {
            position: "absolute",
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            userSelect: "none"
        } as CSSProperties,
        map: undefined as undefined | any
    }

    selectedArea?: string;
    canvas: HTMLCanvasElement|null = null;
    ctx: CanvasRenderingContext2D|null = null;
    container: HTMLDivElement|null = null;
    img: HTMLImageElement|null = null;
    loadEvents = new ImgProLoadEventsWrapper();

    constructor(props) {
        super(props);
        [
            "drawRect",
            "drawCircle",
            "drawPoly",
            "initCanvas",
            "renderPrefilledAreas"
        ].forEach(f => (this[f] = this[f].bind(this)));
        this.styles.map = props.onClick && { cursor: "pointer" };
        this.state = {
            map: this.props.map
        }
    }

    getGroups = memoize(areas => {
        const groups = new Map<string, ImageMapperArea[]>();
        areas
            .filter(area => area.group)
            .forEach(area => {
                    const areas = groups.get(area.group);
                    if (areas) {
                        areas.push(area)
                    } else {
                        groups.set(area.group, [area])
                    }
                }
            )
        return groups;
    });

    shouldComponentUpdate(nextProps, nextState) {
        const propChanged = watchedProps.some(
            prop => !isEqual(this.props[prop], nextProps[prop])
        );
        return !isEqual(this.props.map, this.state.map)
            || propChanged;
    }

    protected updateCacheMap() {
        this.setState({
            map: JSON.parse(JSON.stringify(this.props.map))
        });
    }

    componentDidUpdate(prevProps) {
        this.updateCacheMap();
        // this.initCanvas();
    }

    protected getDrawMethod(shape: ShapeName): DrawMethod|undefined {
        switch (shape) {
            case "circle": return this.drawCircle;
            case "poly": return this.drawPoly;
            case "rect": return this.drawRect;
        }
        return undefined;
    }

    protected drawRect(ctx: CanvasRenderingContext2D, coords, fillColor, lineWidth, strokeColor) {
        let [left, top, right, bot] = coords;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;
        ctx.strokeRect(left, top, right - left, bot - top);
        ctx.fillRect(left, top, right - left, bot - top);
        ctx.fillStyle = this.props.fillColor || '';
    }

    protected drawCircle(ctx: CanvasRenderingContext2D, coords, fillColor, lineWidth, strokeColor) {
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;
        ctx.arc(coords[0], coords[1], coords[2], 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = this.props.fillColor || '';
    }

    protected drawPoly(ctx: CanvasRenderingContext2D, coords, fillColor, lineWidth, strokeColor) {
        coords = coords.reduce(
            (a, v, i, s) => (i % 2 ? a : [...a, s.slice(i, i + 2)]),
            []
        );

        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;
        let first = coords.unshift();
        ctx.moveTo(first[0], first[1]);
        coords.forEach(c => ctx.lineTo(c[0], c[1]));
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = this.props.fillColor || '';
    }

    protected initCanvas(canvas: HTMLCanvasElement, container: HTMLDivElement) {
        const width = this.props.width || (this.img && this.img.clientWidth);
        const height = this.props.height || (this.img && this.img.clientHeight);
        if (!width || !height) {
            throw new Error("Can't determine canvas size");
        }
        canvas.width = width;
        canvas.height = height;
        container.style.width = width + "px";
        container.style.height = height + "px";
        this.ctx = canvas.getContext("2d");
        if (!this.ctx) {
            throw new Error("Can't get 2d context");
        }
        this.ctx.fillStyle = this.props.fillColor || '';
        this.renderPrefilledAreas();
    }

    protected hoverOn(area, index, event) {
        if (this.props.active && this.ctx) {
            const groups = this.getGroups(this.props.map.areas)
            this.selectedArea = area;
            const groupAreas = groups.get(area.group) || [];
            for (const groupArea of groupAreas) {
                const drawMethod = this.getDrawMethod(groupArea.shape);
                drawMethod && drawMethod(
                    this.ctx,
                    this.scaleCoordsToAbsValues(groupArea.coords),
                    groupArea.fillColor || this.props.fillColor || ImageMapper.defaultProps.fillColor,
                    groupArea.lineWidth || this.props.lineWidth || ImageMapper.defaultProps.lineWidth,
                    groupArea.strokeColor || this.props.strokeColor || ImageMapper.defaultProps.strokeColor
                );
            }
        }

        if (this.props.onMouseEnter) {
            this.props.onMouseEnter(area, index, event);
        }
    }

    protected hoverOff(area, index, event) {
        if (this.props.active && this.ctx && this.canvas) {
            this.selectedArea = undefined;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.renderPrefilledAreas();
        }

        if (this.props.onMouseLeave) this.props.onMouseLeave(area, index, event);
    }

    protected click(area, index, event) {
        if (this.props.onClick) {
            event.preventDefault();
            this.props.onClick(area, index, event);
        }
    }

    protected imageClick(event) {
        if (this.props.onImageClick) {
            event.preventDefault();
            this.props.onImageClick(event);
        }
    }

    protected mouseMove(area, index, event) {
        if (this.props.onMouseMove) {
            this.props.onMouseMove(area, index, event);
        }
        if (!this.selectedArea) {
            this.hoverOn(area, index, event);
        }
    }

    protected onImgLoaded(target: HTMLImageElement, preview: boolean, component: ImgPro) {
        if (this.canvas && this.container) {
            this.initCanvas(this.canvas, this.container);
        }
        this.loadEvents.onLoad(target, preview, component);
    }

    protected scaleCoordsToAbsValues(coords: number[]) {
        return coords.map((coord, index) =>
            index % 2
                ? coord * this.props.height // vertical coord
                : coord * this.props.width // horizontal coord
        );
    }

    protected renderPrefilledAreas() {
        this.state.map.areas
            .filter(area => area.preFillColor)
            .forEach(area => {
                this["draw" + area.shape](
                    this.scaleCoordsToAbsValues(area.coords),
                    area.preFillColor,
                    area.lineWidth || this.props.lineWidth,
                    area.strokeColor || this.props.strokeColor
                );
            });
    }

    protected computeCenter(area) {
        if (!area) return [0, 0];

        const scaledCoords = this.scaleCoordsToAbsValues(area.coords);

        switch (area.shape) {
            case "circle":
                return [scaledCoords[0], scaledCoords[1]];
            case "poly":
            case "rect":
            default: {
                // Calculate centroid
                const n = scaledCoords.length / 2;
                const { y, x } = scaledCoords.reduce(
                    ({ y, x }, val, idx) => {
                        return !(idx % 2) ? { y, x: x + val / n } : { y: y + val / n, x };
                    },
                    { y: 0, x: 0 }
                );
                return [x, y];
            }
        }
    }

    renderAreas() {
        return this.state.map.areas.map((area, index) => {
            const scaledCoords = this.scaleCoordsToAbsValues(area.coords);
            const center = this.computeCenter(area);
            const extendedArea = { ...area, scaledCoords, center };
            return (
                <area
                    alt={area.group || area._id || index.toString()}
                    key={area._id || index}
                    shape={area.shape}
                    coords={scaledCoords.join(",")}
                    onMouseEnter={this.hoverOn.bind(this, extendedArea, index)}
                    onMouseLeave={this.hoverOff.bind(this, extendedArea, index)}
                    onMouseMove={this.mouseMove.bind(this, extendedArea, index)}
                    onClick={this.click.bind(this, extendedArea, index)}
                    href={area.href}
                />
            );
        });
    }

    render() {
        this.loadEvents = new ImgProLoadEventsWrapper(this.props.loadEvents);

        return (
            <div style={{
                    ...this.styles.container,
                    width: this.props.width,
                    height: this.props.height
                }}
                 ref={node => (this.container = node)}
            >
                <ImgPro
                    src={this.props.src}
                    previewSrc={this.props.previewSrc}
                    imgRef={node => (this.img = node)}
                    loadEvents={{
                        ...this.loadEvents,
                        onLoad: this.onImgLoaded.bind(this)
                    }}
                    imgProps={{
                        style: this.styles.img,
                        useMap: `#${this.state.map.name}`,
                        onClick: this.imageClick.bind(this)
                    }}
                />
                <canvas ref={node => (this.canvas = node)} style={this.styles.canvas} />
                <map name={this.state.map.name} style={this.styles.map}>
                    {this.renderAreas()}
                </map>
            </div>
        );
    }
}


