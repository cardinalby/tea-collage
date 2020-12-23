const os = require('os');
const collageInfo = require('./collageInfo');
const consts = require('./consts');
const fs = require('fs-extra');
const path = require('path');


(async function() {
    process.stdout.write(`Updating ${consts.COLLAGE_INFO_FILE}...`);

    const collageInfoJson = await fs.readJson(consts.COLLAGE_INFO_FILE);
    collageInfo.updateImgAreas(collageInfoJson);

    await fs.writeJson(consts.COLLAGE_INFO_FILE, collageInfoJson);
    process.stdout.write('done' + os.EOL)
})();

