const fs = require('fs');
const os = require('os')
const path = require('path')
const CONFIG_FILE = path.join(os.tmpdir(), "cxr-cypress.config.json");
const SPEC_FILE = path.join(os.tmpdir(), "crx-cypress-spec-relative-path");

module.exports = function (on) {
  on('before:run', async (details) => {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(details.config, null, 4));
  });
  on('after:run', async()  => {
    fs.unlinkSync(CONFIG_FILE);
  });
  on('before:spec', async(spec) => {
    fs.writeFileSync(SPEC_FILE, spec.relativeToCommonRoot);
  });
  on('after:spec', async(spec) => {
    fs.writeFileSync(SPEC_FILE, spec.relativeToCommonRoot);
  });
};
