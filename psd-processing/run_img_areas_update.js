const os = require('os');
const collageInfo = require('./collageInfo');
const consts = require('./consts');
const fs = require('fs-extra');
const path = require('path');
const psdConfig = require('../resources/psd-config.json');

(async function() {
    const files = psdConfig.targetSizes
        .filter(size => !size.preview)
        .map(size => path.join(consts.COLLAGE_INFO_DIR, size.name) + '.json');

    for (const file of files) {
        process.stdout.write(`Updating ${file}...`);

        const collageInfoJson = await fs.readJson(file);
        collageInfo.updateImgAreas(collageInfoJson);

        await fs.writeJson(file, collageInfoJson);
        process.stdout.write('done' + os.EOL)
    }

})();

