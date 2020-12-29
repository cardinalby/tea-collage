import React, {Component, CSSProperties, MouseEventHandler} from "react";
import isEqual from "react-fast-compare";
import memoize from "memoize-one";
import {SmoothImageLoadEvents, SmoothImageLoadEventsWrapper, SmoothImage} from "./SmoothImage";

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
    imgClassName?: string
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
    loadEvents: SmoothImageLoadEvents,
    onMouseEnter?: ImageMapperMouseEvent,
    onMouseLeave?: ImageMapperMouseEvent,
}

export interface ImageMapperProps extends
    ImageMapperSizeProps,
    ImageMapperStyleProps,
    ImageMapperSourceProps,
    ImageMapperBehaviorProps
{}

interface ImageMapperState {}

type ShapeName = 'poly'|'circle'|'rect';

type DrawMethod = (
    ctx: CanvasRenderingContext2D,
    coords: number[],
    fillColor: string,
    lineWidth: number,
    strokeColor: string
) => void;

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

    selectedArea?: ImageMapperArea;
    canvas: HTMLCanvasElement|null = null;
    ctx: CanvasRenderingContext2D|null = null;
    container: HTMLDivElement|null = null;
    img: HTMLImageElement|null = null;
    loadEvents = new SmoothImageLoadEventsWrapper();

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
    }

    getGroups() {
        const scaledMap = this.getScaledMap(this.props.map, this.props.width, this.props.height);
        const groups = new Map<string, ImageMapperArea[]>();
        scaledMap.areas
            .filter(area => area.group)
            .forEach(area => {
                    const areas = groups.get(area.group as string);
                    if (areas) {
                        areas.push(area)
                    } else {
                        groups.set(area.group as string, [area])
                    }
                }
            )
        return groups;
    };

    getScaledMap = memoize((map: ImageMapperMap, width: number, height: number): ImageMapperMap => {
        const scaleCoords = (coords: number[], width: number, height: number): number[] =>
            coords.map((coord, index) =>
                index % 2
                    ? coord * height // vertical coord
                    : coord * width // horizontal coord
            );
        return {
            name: map.name,
            areas: map.areas.map(area => ({
                ...area,
                coords: scaleCoords(area.coords, width, height)
            }))
        };
    }, isEqual) ;

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

    protected hoverOn(area: ImageMapperArea, index, event) {
        if (this.props.active && this.ctx) {
            const groups = this.getGroups()
            this.selectedArea = area;
            const groupAreas = (area.group && groups.get(area.group)) || [];
            for (const groupArea of groupAreas) {
                const drawMethod = this.getDrawMethod(groupArea.shape);
                drawMethod && drawMethod(
                    this.ctx,
                    groupArea.coords,
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

    protected onImgLoaded(target: HTMLImageElement, preview: boolean, component: any) {
        if (this.canvas && this.container) {
            this.initCanvas(this.canvas, this.container);
        }
        this.loadEvents.onLoad(target, preview, component);
    }

    protected renderPrefilledAreas() {
        this.getScaledMap(this.props.map, this.props.width, this.props.height)
            .areas
            .filter(area => area.preFillColor)
            .forEach(area => {
                this["draw" + area.shape](
                    area.coords,
                    area.preFillColor,
                    area.lineWidth || this.props.lineWidth,
                    area.strokeColor || this.props.strokeColor
                );
            });
    }

    renderAreas() {
        return this.getScaledMap(this.props.map, this.props.width, this.props.height)
            .areas
            .map((area: ImageMapperArea, index) => {
                return (
                    <area
                        alt={area.group || area._id || index.toString()}
                        key={area._id || index}
                        shape={area.shape}
                        coords={area.coords.join(",")}
                        onMouseEnter={this.hoverOn.bind(this, area, index)}
                        onMouseLeave={this.hoverOff.bind(this, area, index)}
                        onMouseMove={this.mouseMove.bind(this, area, index)}
                        onClick={this.click.bind(this, area, index)}
                        href={area.href}
                    />
                );
            });
    }

    render() {
        this.loadEvents = new SmoothImageLoadEventsWrapper(this.props.loadEvents);
        return (
            <div style={{
                    ...this.styles.container,
                    width: this.props.width,
                    height: this.props.height
                }}
                 ref={node => (this.container = node)}
            >
                <SmoothImage
                    src={this.props.src}
                    previewSrc={this.props.previewSrc}
                    imgRef={node => (this.img = node)}
                    loadEvents={{
                        ...this.loadEvents,
                        onLoad: this.onImgLoaded.bind(this)
                    }}
                    imgProps={{
                        style: this.styles.img,
                        className: this.props.imgClassName,
                        useMap: `#${this.props.map.name}`,
                        onClick: this.imageClick.bind(this)
                    }}
                />
                <canvas ref={node => (this.canvas = node)} style={this.styles.canvas} />
                <map name={this.props.map.name} style={this.styles.map}>
                    {this.renderAreas()}
                </map>
            </div>
        );
    }
}


