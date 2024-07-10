// tests/test_helpers.js
const path = require('path');

function normalizePath(pathString) {
  return pathString.split(path.sep).join('/');
}

module.exports = {
  normalizePath
}