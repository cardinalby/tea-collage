const os = require('os');
const imgAreasMap = require('./imgAreasMap');
const consts = require('./consts');
const fs = require('fs-extra');
const path = require('path');

(async function() {
    const file = path.join(consts.COLLAGE_INFO_DIR, consts.COLLAGE_INFO_AREAS_MAP_JSON);
    process.stdout.write(`Updating ${file}...`);

    const areasMap = await fs.readJson(file);
    imgAreasMap.updateImgAreas(areasMap);

    await fs.writeJson(file, areasMap);
    process.stdout.write('done' + os.EOL)
})();

