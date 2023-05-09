const fs = require('fs');
const os = require('os')
const path = require('path')
const CONFIG_FILE = path.join(os.tmpdir(), "cypress-xml-reporter.config.json");
var SPEC_FILE;
var socketId;

module.exports = function (on) {
  on('before:run', async (details) => {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(details.config, null, 4));
    socketId = details.config.socketId;
  });
  on('after:run', async()  => {
    fs.unlinkSync(SPEC_FILE);
  });
  on('before:spec', async(spec) => {
    SPEC_FILE = path.join(os.tmpdir(), "cypress-xml-reporter.spec-relative-path."+socketId);
    fs.writeFileSync(SPEC_FILE, spec.relativeToCommonRoot);
  });
};
