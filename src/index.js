const check = require('./check/check.js');
const vue = require('./parse/vue.js');
const eslint = require('./check/eslint.js');
const parse = require('./check/parse.js');
module.exports = {
  check: async function(type, folder) {
    try {
      switch (type) {
        case 'modify':
          await check.eslintCheck(folder, true);
          break;
        case 'all':
          await check.eslintCheck(folder, false);
          break;
        default:
          console.warn('unknown check type: ', type);
          break;
      }
    }
    catch (e) {
      console.error('check error: ', e);
    }
  },
  format: async function(type, folder, {
    formatInput = [0, 1, 2], // [script, template, style]
  } = {}) {
    try {
      switch (type) {
        case 'modify':
          console.log('format modify');
          eslint.formatEslint(folder, true);
          break;
        case 'all':
          console.log('format all');
          eslint.formatEslint(folder);
          break;
        case 'vue':
          vue.formatVue(folder, formatInput);
          break;
        default:
          console.warn('unknown format type: ', type);
          break;
      }
    }
    catch (e) {
      console.error('format error: ', e);
    }
  },
  parse: async function(folder) {
    parse.parseError(folder)
  }
};
