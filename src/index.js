const check = require('./check/check.js');
const eslint = require('./check/eslint.js');
const errorParse = require('./check/error.js');
module.exports = {
  check: async function(type, folder) {
    try {
      switch (type) {
        case 'modify':
          await check.eslintCheck(folder, true);
          break;
        case 'all':
          // TODO: 待开发
          await check.eslintCheck(folder);
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
  format: async function(type, folder) {
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
        default:
          console.warn('unknown format type: ', type);
          break;
      }
    }
    catch (e) {
      console.error('format error: ', e);
    }
  }
};
