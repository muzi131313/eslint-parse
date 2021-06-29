const check = require('./check/check.js');
const vue = require('./parse/vue.js');
const format = require('./check/format.js');
const parse = require('./check/parse.js');
const { log, error } = require('./utils/log.js');
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
          log('[format] modify');
          format.eslint(folder, true);
          break;
        case 'all':
          log('[format] all');
          format.eslint(folder);
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
      error('format error: ', e);
    }
  },
  parse: async function(folder) {
    parse.parseError(folder)
  }
};
