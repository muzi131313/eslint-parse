module.exports = {
  check(type) {
    switch (type) {
      case 'modify':
        console.log('check modify');
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
