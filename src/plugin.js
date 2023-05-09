const fs = require('fs');
const os = require('os')
const path = require('path')
const CONFIG_FILE = path.join(os.tmpdir(), "cxr.config.json");
var currentSpecHandle;
var uniqueFileId;

module.exports = function (on) {
  on('before:run', async (details) => {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(details.config, null, 4));
    uniqueFileId = details.config.socketId;
  });
  on('after:run', async()  => {
    fs.unlinkSync(currentSpecHandle);
  });
  on('before:spec', async(spec) => {
    currentSpecHandle = path.join(os.tmpdir(), "cxr.spec-relative-path."+uniqueFileId);
    fs.writeFileSync(currentSpecHandle, spec.relativeToCommonRoot);
  });
};
