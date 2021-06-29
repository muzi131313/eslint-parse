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
const { log, info } = require('../utils/log.js');

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
async function formatQueue(onceLength, queues) {
  const execResults = [];
  const execErrors = [];
  const executes = [];
  const handleInfo = info => {
    // handle result
    if (info.err) {
      execErrors.push(info.err);
    }
    if (info.done) {
      execResults.push(info.data);
    }
    else {
      execErrors.push(info.data);
    }
  }
  if (queues.length < onceLength) {
    const infos = await Promise.all(queues.map(_path => execCommand(getCommand(_path))));
    infos.forEach(handleInfo)
  }
  else {
    for (let i = 0; i < queues.length; i++) {
      const _path = queues[i];
      const promise = execCommand(getCommand(_path));
      const delExecute = () => {
        // del the resolved/reject promise
        executes.splice(executes.indexOf(execute), 1)
      }
      const execute = promise
        .then(info => {
          handleInfo(info);
          delExecute();
        })
        .catch(err => {
          execErrors.push(err)
          delExecute();
        })
      executes.push(execute);
      if (executes.length >= onceLength) {
        await Promise.race(executes);
      }
    }
  }
  return {
    results: execResults,
    errors: execErrors,
  };
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
    info('[format] no file format');
    return;
  }
  log('files: ', files);
  let eslintJSVueFiles = await getIgnoreFiles(files, folder);
  log('[debug] eslintJSVueFiles: ', eslintJSVueFiles)

  // === test code start ===
  // 队列测试代码
  // eslintJSVueFiles = eslintJSVueFiles.splice(10, 15);
  // 单个文件测试
  // eslintJSVueFiles = [eslintJSVueFiles[1]];
  // log('eslintJSVueFiles: ', eslintJSVueFiles);
  // === test code end ===

  const { results, errors } = await formatQueue(10, eslintJSVueFiles);

  const tempResPath = getTempFilePath(folder, 'eslint-res.txt');
  const tempErrorPath = getTempFilePath(folder, 'eslint-error.txt')
  log('[format] tempResPath: ', tempResPath)
  await writeArrayToFile(tempResPath, results);
  await writeArrayToFile(tempErrorPath, errors);

  info('[format] eslint format done')
}

module.exports = {
  eslint
}
