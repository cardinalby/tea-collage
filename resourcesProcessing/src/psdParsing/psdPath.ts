import {Path, SubPath, SubpathPoint} from "./psdParsingResult";

const RECORD_TYPE = {
    CLOSED_SUBPATH_LENGTH: 0,
    CLOSED_SUBPATH_KNOT_LINKED: 1
};

function getRecordPoint(knotRecord): SubpathPoint {
    // Specific for PDF.js parsed values
    const normalizeRelativeValue = value => value > 128 ? value - 256 : value;

    return {
        x: normalizeRelativeValue(knotRecord.anchor.horiz),
        y: normalizeRelativeValue(knotRecord.anchor.vert),
        };
}

export function parsePath(psdPathRecords): Path {
    const subPaths: Path = [];
    let ongoingSubPath: {points: SubPath, pointIndex: number}|undefined = undefined;
    for (const record of psdPathRecords) {
        if (record.recordType === RECORD_TYPE.CLOSED_SUBPATH_LENGTH) {
            if (ongoingSubPath) {
                throw new Error(
                    'New subpath started before the end of previous.' +
                    `(${ongoingSubPath.pointIndex + 1} out of ${ongoingSubPath.points.length} collected)`
                );
            }
            ongoingSubPath = {
                points: Array(record.numPoints),
                pointIndex: 0
            };
        }
        else if (ongoingSubPath) {
            if (record.recordType !== RECORD_TYPE.CLOSED_SUBPATH_KNOT_LINKED) {
                throw new Error(`Unsupported recordType in subpath: ${record.recordType}`);
            }

            ongoingSubPath.points[ongoingSubPath.pointIndex] = getRecordPoint(record);
            ++ongoingSubPath.pointIndex;
            if (ongoingSubPath.points.length === ongoingSubPath.pointIndex) {
                subPaths.push(ongoingSubPath.points);
                ongoingSubPath = undefined;
            }
        }
    }
    return subPaths;
}