import React, {Component, CSSProperties, MouseEventHandler} from "react";
import isEqual from "react-fast-compare";
import memoize from "memoize-one";
import {SmoothImageLoadEvents, SmoothImageLoadEventsWrapper, SmoothImage} from "./SmoothImage";
import {TFunction} from "i18next";

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
    t?: TFunction,
    fillColor?: string,
    strokeColor?: string,
    lineWidth?: number,
    containerClassName?: string
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
        strokeColor: "rgba(0, 0, 0, 1)"
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
            "initCanvas"
        ].forEach(f => (this[f] = this[f].bind(this)));
        this.styles.map = props.onClick && { cursor: "pointer" };
    }

    componentDidUpdate(prevProps: Readonly<ImageMapperProps>) {
        if ((
            this.props.width !== prevProps.width ||
            this.props.height !== prevProps.height ||
            !isEqual(this.props.map, prevProps.map)
            ) &&
            this.canvas && this.container
        ) {
            this.initCanvas(this.canvas, this.container);
        }
    }

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

        function limit(value: number, min: number, max: number): number {
            return value < min ? min : (value > max ? max : value);
        }
        function handleBorder(value: number, maxSize: number): number {
            return limit(value, Math.floor(lineWidth/2), Math.ceil(maxSize - lineWidth/2));
        }
        function handleCoordsPair(coordsPair: [number, number]): [number, number] {
            return [
                handleBorder(coordsPair[0], ctx.canvas.clientWidth),
                handleBorder(coordsPair[1], ctx.canvas.clientHeight)
            ];
        }
        coords = coords.reduce(
            (a, v, i, s) => (i % 2 ? a : [...a, s.slice(i, i + 2)]),
            []
        );
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;
        let first = coords.unshift();
        ctx.moveTo(...handleCoordsPair(first));
        coords.forEach(pair => ctx.lineTo(...handleCoordsPair(pair)));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = this.props.fillColor || '';
    }

    protected initCanvas(canvas: HTMLCanvasElement, container: HTMLDivElement) {
        const width = this.props.width || (this.img && this.img.clientWidth);
        const height = this.props.height || (this.img && this.img.clientHeight);
        if (!width || !height) {
            return;
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
    }

    protected getAreasByGroup(group: string) {
        return this.getScaledMap(this.props.map, this.props.width, this.props.height)
            .areas
            .filter(area => area.group === group);
    };

    protected hoverOn(area: ImageMapperArea, index, event) {
        if (this.props.active && this.ctx) {
            this.selectedArea = area;
            const areas = area.group
                ? this.getAreasByGroup(area.group)
                : [area];
            for (const areaToDraw of areas) {
                const drawMethod = this.getDrawMethod(areaToDraw.shape);
                drawMethod && drawMethod(
                    this.ctx,
                    areaToDraw.coords,
                    areaToDraw.fillColor || this.props.fillColor || ImageMapper.defaultProps.fillColor,
                    areaToDraw.lineWidth || this.props.lineWidth || ImageMapper.defaultProps.lineWidth,
                    areaToDraw.strokeColor || this.props.strokeColor || ImageMapper.defaultProps.strokeColor
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

    protected onImgLoaded(target: HTMLImageElement, preview: boolean, componentId: any) {
        if (this.canvas && this.container) {
            this.initCanvas(this.canvas, this.container);
        }
        this.loadEvents.onLoad(target, preview, componentId);
    }

    renderAreas() {
        return this.getScaledMap(this.props.map, this.props.width, this.props.height)
            .areas
            .map((area: ImageMapperArea, index) => {
                const teaName = area.group && this.props.t && this.props.t(`teas.${area.group}.name`);
                return (
                    <area
                        title={teaName}
                        alt={teaName}
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
                 className={this.props.containerClassName}
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


