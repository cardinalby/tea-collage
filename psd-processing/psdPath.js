
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

    convertToAbsCoords(imgWidth, imgHeight) {
        const limitValue = (value, from, to) => value < from ? from : (value > to ? to : value);

        this.x = limitValue(Math.round(imgWidth * this.x), 0, imgWidth);
        this.y = limitValue(Math.round(imgHeight * this.y), 0, imgHeight);
    }
}

/**
 * @property {SubpathPoint[]} points
 */
class SubPath {
    constructor(points) {
        this.points = points
    }

    convertToAbsCoords(width, height) {
       this.points.forEach(point => point.convertToAbsCoords(width, height));
    }

    getImgMapCoords() {
        const coords = [];
        for (let point of this.points) {
            coords.push(point.x, point.y);
        }
        return coords;
    }
}

/**
 * @property {SubPath[]} subPathes
 */
class Path {
    constructor(subPathes) {
        this.subPathes = subPathes;
    }

    convertToAbsCoords(width, height) {
        this.subPathes.forEach(subpath => subpath.convertToAbsCoords(width, height));
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