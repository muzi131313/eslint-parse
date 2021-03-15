const fs = require('fs');
const path = require('path');
const { readFiles, dirExists, execCommand, getIgnoreFiles } = require('./utils/tool.js');
const { getDiffFiles } = require('./utils/diff.js');
const parseCommand = require('./command.js');

/**
 * @name getCommand
 * @description 获取要执行的命令
 * @param {String} _path 要格式化文件的路径
 * @created 2021年01月13日17:22:15
 */
function getCommand(_path) {
  return `npx eslint ${_path} -c .eslintrc.js --fix`;
}

// 按照队列格式化
// eslint-disable-next-line
async function formatQueque(queues, onceLength, execResults = [], execErrors = []) {
  if (!queues.length) {
    return {
      results: execResults,
      errors: execErrors,
    };
  }
  if (queues.length < onceLength) {
    return await formatQueque(queues, queues.length, execResults, execErrors);
  } else {
    const execPromises = queues.splice(0, onceLength).map(async (_path) => await execCommand(getCommand(_path)));
    const infos = await Promise.all(execPromises);
    infos.forEach((info) => {
      if (info.err) {
        execErrors.push(info.err);
      }
      if (info.done) {
        execResults.push(info.data);
      } else {
        execErrors.push(info.data);
      }
    });
    return await formatQueque(queues, onceLength, execResults, execErrors);
  }
}

// 获取文件夹
function getFolder(_path) {
  const operateIndex = _path.lastIndexOf('/');
  const _folder = _path.substring(0, operateIndex + 1);
  return path.join(__dirname, _folder);
}

/**
 * @name writeArrayToFile
 * @description 写数组到文件中
 * @param {String} path 路径
 * @param {Array} arrays 要写的数组数据
 * @created 2021年01月13日16:52:32
 */
async function writeArrayToFile(_path, arrays) {
  const _folder = getFolder(_path);
  // 写之前先校验路径
  await dirExists(_folder);

  let txt = '';
  arrays.forEach((_txt) => {
    if (_txt) {
      txt += '\n';
      txt += _txt;
    }
  });
  const absolutePath = path.join(__dirname, _path);
  fs.writeFileSync(absolutePath, txt, 'utf8');
}

/**
 * @name formatEslint
 * @description eslint 格式化 js,vue 文件
 * @created 2021年01月13日15:22:43
 */
async function formatEslint(options) {
  const files = options && options.modify
    ? (await getDiffFiles('../../../')).filter(item => item.includes('src/'))
    : readFiles();
  if (!files || !files.length) {
    return;
  }
  let eslintJSVueFiles = getIgnoreFiles(files);

  // === test code start ===
  // 队列测试代码
  // eslintJSVueFiles = eslintJSVueFiles.splice(10, 15);
  // 单个文件测试
  // eslintJSVueFiles = [eslintJSVueFiles[1]];
  // console.log('eslintJSVueFiles: ', eslintJSVueFiles);
  // === test code end ===

  const { results, errors } = await formatQueque(eslintJSVueFiles, 30);

  await writeArrayToFile('../../.tmp/logs/eslint-res.txt', results);
  await writeArrayToFile('../../.tmp/logs/eslint-error.txt', errors);

  console.log('eslint format done~');
}

const options = parseCommand();
formatEslint(options);
