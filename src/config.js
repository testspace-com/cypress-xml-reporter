const fs = require('fs');

module.exports = function (on) {
  on('before:run', async (details) => {
    fs.writeFileSync("__config.json", JSON.stringify(details.config, null, 4));
  });
  on('after:run', async()  => {
    fs.unlinkSync("__config.json");
  });
};
