const fs = require('fs');
const os = require('os')
const path = require('path')
const CONFIG_FILE = path.join(os.tmpdir(), "cxr-cypress.config.json");

module.exports = function (on) {
  on('before:run', async (details) => {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(details.config, null, 4));
  });
  on('after:run', async()  => {
    fs.unlinkSync(CONFIG_FILE);
  });
};
