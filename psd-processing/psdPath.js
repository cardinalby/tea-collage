
const RECORD_TYPE = {
    CLOSED_SUBPATH_LENGTH: 0,
    CLOSED_SUBPATH_KNOT_LINKED: 1
};

/**
 * @property x
 * @property y
 */
class SubpathPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @param {object} obj
     * @return SubpathPoint
     */
    static deserialize(obj) {
        return new SubpathPoint(obj.x, obj.y);
    }

    copy() {
        return new SubpathPoint(this.x, this.y);
    }
}

/**
 * @property {SubpathPoint[]} points
 */
class SubPath {
    constructor(points) {
        this.points = points
    }

    /**
     * @param {object} obj
     * @return SubPath
     */
    static deserialize(obj) {
        return new SubPath(obj.points.map(point => SubpathPoint.deserialize(point)));
    }

    getImgMapCoords(restrictWidth, restrictHeight) {
        const coords = [];
        const limitValue = (value, from, to) => value < from ? from : (value > to ? to : value);
        for (let point of this.points) {
            coords.push(
                restrictWidth ? limitValue(point.x, 0, restrictWidth) : point.x,
                restrictHeight ? limitValue(point.y, 0, restrictHeight) : point.y
            );
        }
        return coords;
    }

    copy() {
        return new SubPath(
            this.points && this.points.map(point => point.copy())
        );
    }
}

/**
 * @property {SubPath[]} subPathes
 */
class Path {
    constructor(subPathes) {
        this.subPathes = subPathes;
    }

    /**
     * @param {object} obj
     * @return Path
     */
    static deserialize(obj) {
        return new Path(obj.subPathes.map(subPath => SubPath.deserialize(subPath)));
    }

    copy() {
        return new Path(
            this.subPathes && this.subPathes.map(subpath => subpath.copy())
        )
    }
}

function getRecordPoint(knotRecord) {
    // Specific for PDF.js parsed values
    const normalizeRelativeValue = value => value > 128 ? value - 256 : value;

    return new SubpathPoint(
        normalizeRelativeValue(knotRecord.anchor.horiz),
        normalizeRelativeValue(knotRecord.anchor.vert),
        );
}

function parsePaths(paths) {
    const subpaths = [];
    let subpathPoints = null;
    let subpathPointIndex = null;
    for (const record of paths) {
        if (record.recordType === RECORD_TYPE.CLOSED_SUBPATH_LENGTH) {
            if (subpathPoints !== null) {
                throw new Error(
                    'New subpath started before the end of previous.' +
                    `(${subpathPointIndex + 1} out of ${subpathPoints.length} collected)`
                );
            }
            subpathPoints = new Array(record.numPoints);
            subpathPointIndex = 0;
        }
        else if (subpathPoints !== null) {
            if (record.recordType !== RECORD_TYPE.CLOSED_SUBPATH_KNOT_LINKED) {
                throw new Error(`Unsupported recordType in subpath: ${record.recordType}`);
            }

            subpathPoints[subpathPointIndex] = getRecordPoint(record);
            ++subpathPointIndex;
            if (subpathPoints.length === subpathPointIndex) {
                subpaths.push(new SubPath(subpathPoints));
                subpathPoints = null;
                subpathPointIndex = null;
            }
        }
    }
    return new Path(subpaths);
}

exports.parsePaths = parsePaths;
exports.SubPath = SubPath;
exports.Path = Path;
exports.SubpathPoint = SubpathPoint;