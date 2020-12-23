import ImageMapper from "react-image-mapper";

export default class GroupImageMapper extends ImageMapper {
    constructor(props) {
        super(props);

        this.groups = new Map();
        const addGroupArea = (group, area) => this.groups.has(group)
            ? this.groups.get(group).push(area)
            : this.groups.set(group, [area]);

        for (const area of props.map.areas) {
            if (area.group !== undefined) {
                addGroupArea(area.group, area);
            }
        }
    }

    hoverOn(area, index, event) {
        if (this.props.active) {
            const groupAreas = this.groups.get(area.group);
            for (const groupArea of groupAreas) {
                const drawMethod = "draw" + groupArea.shape;
                if (this[drawMethod]) {
                    this[drawMethod](
                        this.scaleCoords(groupArea.coords),
                        groupArea.fillColor || this.props.fillColor,
                        groupArea.lineWidth || this.props.lineWidth,
                        groupArea.strokeColor || this.props.strokeColor
                    );
                }
            }
        }

        if (this.props.onMouseEnter) {
            this.props.onMouseEnter(area, index, event);
        }
    }
}