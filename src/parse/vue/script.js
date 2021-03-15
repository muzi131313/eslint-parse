/**
 * @name getScripts
 * @description 获取script模板信息
 * @param {String} str 字符串
 * @param {Array} _array 数组
 * @return {
 *  str: {String}, // 剩余的字符串
 *  array: {Array}, // 模板列表
 * }
 */
module.exports = function getScripts(str, _array = []) {
  let strCopy = str;
  const templateReg = /<script[\s\S]*(<\/script>)/;
  const templateMatchInfo = strCopy.match(templateReg);
  let templateStr;
  if (templateMatchInfo) {
    templateStr = templateMatchInfo[0];
    strCopy = strCopy.replace(templateStr, '');
    _array.push(templateStr);
    return getScripts(strCopy, _array);
  } else {
    return {
      str: strCopy,
      array: _array,
    };
  }
};
