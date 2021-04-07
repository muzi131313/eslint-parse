const check = require('./check/check.js');
module.exports = {
  check: async function(type, folder) {
    switch (type) {
      case 'modify':
        console.log('check modify');
        await check.eslintCheck(folder);
        break;
      case 'all':
        console.log('check all');
        break;
      default:
        console.warn('unkown type: ', type);
        break;
    }
  },
};
