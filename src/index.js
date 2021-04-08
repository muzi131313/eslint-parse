const check = require('./check/check.js');
const eslint = require('./check/eslint.js');
const errorParse = require('./check/error.js');
module.exports = {
  check: async function(type, folder) {
    switch (type) {
      case 'modify':
        console.log('check modify');
        // await check.eslintCheck(folder);
        eslint.formatEslint(folder, true);
        break;
      case 'all':
        console.log('check all');
        eslint.formatEslint(folder);
        break;
      default:
        console.warn('unknown type: ', type);
        break;
    }
  },
};
