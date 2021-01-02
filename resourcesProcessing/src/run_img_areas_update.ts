import * as consts from './consts';
import {updateImgAreasStyle} from "./jsonExport/imgAreasMap";
const os = require('os');
const fs = require('fs-extra');
const path = require('path');

(async function() {
    const file = path.join(consts.COLLAGE_INFO_DIR, consts.COLLAGE_INFO_AREAS_MAP_JSON);
    process.stdout.write(`Updating ${file}...`);

    const areasMap = await fs.readJson(file);
    updateImgAreasStyle(areasMap);

    await fs.writeJson(file, areasMap);
    process.stdout.write('done' + os.EOL)
})();

