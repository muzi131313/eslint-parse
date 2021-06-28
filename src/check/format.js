const {
  readFiles,
  createDirNotExist,
  execCommand,
  getIgnoreFiles,
  isShouldEslintFiles,
  writeArrayToFile,
  getTempFilePath,
} = require('../utils/tool.js');
const { getDiffFiles } = require('../utils/diff.js');
const { log } = require('../utils/log.js');

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
async function formatQueue(queues, onceLength, execResults = [], execErrors = []) {
  if (!queues.length) {
    return {
      results: execResults,
      errors: execErrors,
    };
  }
  if (queues.length < onceLength) {
    return await formatQueue(queues, queues.length, execResults, execErrors);
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
    return await formatQueue(queues, onceLength, execResults, execErrors);
  }
}

/**
 * @name eslint
 * @description eslint 格式化 js,vue 文件
 * @created 2021年01月13日15:22:43
 */
async function eslint(folder, isModify) {
  const isFolderExist = await createDirNotExist(folder, true);
  if (!isFolderExist) {
    log(`format folder[${folder}] not exist`)
    return;
  }
  const files = isModify
    ? isShouldEslintFiles(await getDiffFiles(folder))
    : isShouldEslintFiles(readFiles(folder));
  if (!files || !files.length) {
    log('no file format');
    return;
  }
  log('files: ', files);
  let eslintJSVueFiles = getIgnoreFiles(files, folder);
  log('[debug] eslintJSVueFiles: ', eslintJSVueFiles)

  // === test code start ===
  // 队列测试代码
  // eslintJSVueFiles = eslintJSVueFiles.splice(10, 15);
  // 单个文件测试
  // eslintJSVueFiles = [eslintJSVueFiles[1]];
  // log('eslintJSVueFiles: ', eslintJSVueFiles);
  // === test code end ===

  const { results, errors } = await formatQueue(eslintJSVueFiles, 30);

  const tempResPath = getTempFilePath(folder, 'eslint-res.txt');
  const tempErrorPath = getTempFilePath(folder, 'eslint-error.txt')
  log('[debug] tempResPath: ', tempResPath)
  await writeArrayToFile(tempResPath, results);
  await writeArrayToFile(tempErrorPath, errors);

  log('eslint format done~');
}

module.exports = {
  eslint
}
