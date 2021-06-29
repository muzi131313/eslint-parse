const fs = require('fs');
const path = require('path');
const { createDirNotExist, getTempFilePath, getFolder } = require('../utils/tool.js');
const { log, info } = require('../utils/log.js');

// 获取 error 生成内容: eslint-res.txt
function getErrorText(folder) {
  const _resPath = getTempFilePath(folder, 'eslint-res.txt');
  const _resData = fs.readFileSync(_resPath, 'utf8');
  return _resData;
}

// 解析当前行
function parseLine(str) {
  const lineInfo = str
    .split(/[ ]{2,}/)
    .filter((item) => item)
    .map((item) => item.trim());
  log('[parse] lineInfo: ', lineInfo);
  return lineInfo;
}

// 解析当前行的信息: [ 总数量, error数量, warn数量 ]
function parseNextLine(nextItem) {
  const nextFirstLine = nextItem.split('\n')[0];
  const lineInfo = nextFirstLine.match(/[\d]*/g).filter((item) => item);
  return lineInfo;
}

// 获取 error 信息
function getErrorInfo(_resData) {
  var errorNum = 0;
  var warnNum = 0;
  var errorInfos = {}; // 解析后结果
  var splitArray = _resData.split('✖');
  var splitLength = splitArray.length;
  var notHandlers = [];
  splitArray.some((item, index) => {
    if (index === splitLength - 1) {
      return true;
    }
    const splitItem = item.split('\n').filter((item) => item);
    // 除了第一个，删除不要的行号信息
    if (index !== 0) {
      splitItem.splice(0, 1);
    }

    log('[parse] splitItem: ', splitItem)
    const location = splitItem.splice(0, 1);
    log('[parse] location: ', location);
    splitItem.forEach((_item) => {
      const _itemInfo = parseLine(_item);
      // 添加位置
      _itemInfo.splice(_itemInfo.length, 0, location[0]);

      if (_itemInfo && _itemInfo.length === 5) {
        const error = _itemInfo[3];
        if (!errorInfos[error]) {
          errorInfos[error] = [];
        }
        errorInfos[error].push(_itemInfo);
      } else {
        notHandlers.push(_itemInfo);
      }
    });
    // 统计信息: error num/warn num
    const nextItem = splitArray[index + 1];
    const lineInfo = parseNextLine(nextItem);
    if (lineInfo.length === 3) {
      errorNum += Number(lineInfo[1]);
      warnNum += Number(lineInfo[2]);
    }
    log('[parse] item: ', item);
    log('[parse] lineInfo: ', lineInfo);
    return false;
  });
  return {
    info: errorInfos,
    spare: notHandlers,
    error: errorNum,
    warn: warnNum,
  };
}

async function parseError(folder) {
  var _errorTxt = '';
  const _resData = getErrorText(folder);
  log('[parse] _resData: ', _resData);
  const _resInfo = getErrorInfo(_resData);
  log('[parse] _resInfo: ', _resInfo);
  const errorNum = _resInfo.error;
  const warnNum = _resInfo.warn;
  const _info = _resInfo.info;

  _errorTxt += `error num: ${errorNum}`;
  _errorTxt += '\n';
  _errorTxt += `warn num: ${warnNum}`;
  _errorTxt += '\n';

  Object.keys(_info).forEach((key) => {
    const _itemInfo = _info[key];
    const _itemLength = _itemInfo.length;

    _errorTxt += `${key}\t${_itemLength}`;
    _errorTxt += '\n';

    _itemInfo.forEach((_item) => {
      const _itemStr = _item.join('    ');
      _errorTxt += _itemStr;
      _errorTxt += '\n';
    });
    _errorTxt += '\n\n';
  });

  const tempParsePath = getTempFilePath(folder, 'eslint-parse.txt')
  const tempParseFolder = getFolder(tempParsePath);
  log('[parse] temp path: ', tempParsePath);
  // 写之前先校验路径
  await createDirNotExist(tempParseFolder);
  fs.writeFileSync(tempParsePath, _errorTxt, 'utf8');
  info('[parse] done');
}

module.exports = {
  parseError
}
