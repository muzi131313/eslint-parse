const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const { log } = require('./log.js');

const tools = {};

/**
 * @name isNeedFilter
 * @param {String} _path 路径
 * @description 是否有必要过滤
 * @returns
 * @created 2021年04月08日18:19:06
 */
function isNeedFilter(_path) {
  const _need = _path.includes('node_modules')
    || _path.includes('.git');
  return _need;
}

/**
 * @name readFiles
 * @description 读取指定目录下的所有文件
 * @param {*} baseDirectory 目录(相对src同级目录执行此node脚本)
 * @param {*} _files 存储所有的文件绝对路径位置
 * @created 2021年01月12日14:17:36
 */
function readFiles(baseDirectory = '../src', _files = []) {
  // const _dir = path.join(__dirname, baseDirectory);
  const _dir = baseDirectory;
  const files = fs.readdirSync(_dir);
  log('readFiles, files: ', files);
  files.forEach((_file) => {
    const _path = `${_dir}/${_file}`;
    const data = fs.statSync(_path);
    if (isNeedFilter(_path)) {
      return;
    }
    if (data.isFile()) {
      _files.push(_path);
    } else if (data.isDirectory()) {
      readFiles(`${baseDirectory}/${_file}`, _files);
    }
  });
  return _files;
}

/**
 * 读取路径信息
 * @param {string} path 路径
 */
function getStat(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        resolve(false);
      } else {
        resolve(stats);
      }
    });
  });
}

/**
 * 创建路径
 * @param {string} dir 路径
 */
function mkdir(dir) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * 路径是否存在，不存在则创建
 * @param {string} dir 路径
 */
async function dirExists(dir, isCheck = false) {
  try {
    let isExists = await getStat(dir);
    // 如果该路径且不是文件，返回true
    if (isExists && isExists.isDirectory()) {
      return true;
    } else if (isExists) {
      // 如果该路径存在但是文件，返回false
      return false;
    }
    if (isCheck) {
      return false;
    }
    // 如果该路径不存在
    let tempDir = path.parse(dir).dir; // 拿到上级路径
    // 递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
    let status = await dirExists(tempDir);
    let mkdirStatus;
    if (status) {
      mkdirStatus = await mkdir(dir);
    }
    return mkdirStatus;
  }
  catch (e) {
    log(e);
    return false;
  }
}

/**
 * @name execCommand
 * @description 执行命令
 * @param {String} command 要执行的命令
 * @created 2021年01月13日15:26:25
 */
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      // if (err) {
      //   reject(err);
      //   return;
      // }
      resolve({
        done: stderr ? false : true,
        data: stderr ? stderr : stdout,
        err,
      });
    });
  });
}

/**
 * @name getIgnorePath
 * @param {String} folder 要校验的路径
 * @description 获取 .eslintignore 的路径
 * @returns
 * @created 2021年04月08日17:16:57
 */
function getIgnorePath(folder = '') {
  const _dirname = path.join(__dirname, '../../');
  if (folder.endsWith('src')) {
    folder = folder.replace('/src', '');
  }
  const isIncludeFolder = folder && folder.includes(_dirname);
  const ignorePath = isIncludeFolder
    ? `${folder}/.eslintignore`
    : path.join(__dirname, folder, '.eslintignore');
  return ignorePath;
}

/**
 * @name readEslintIgnore
 * @description 读取 .eslintignore 文件
 * @created 2021年01月13日15:10:29
 */
function readEslintIgnore(folder = '') {
  try {
    const ignorePath = getIgnorePath(folder);
    const fileData = fs.readFileSync(ignorePath, 'utf-8');
    // console.log('[debug] fileData: \n', fileData);
    let ignores = fileData.split('\n');
    ignores = ignores.filter((ignore) => ignore && !ignore.includes('#'));
    ignores = ignores.map((ignore) => {
      const firstIndex = ignore.indexOf('*');
      const lastIndex = ignore.lastIndexOf('*');
      const ignoreLength = ignore.length
      if (firstIndex !== lastIndex) {
        // 通配符在结尾的
        if (ignoreLength > lastIndex) {
          return ignore.substring(lastIndex + 1, ignoreLength);
        }
        // 通配符在前面的
        return ignore.substring(0, firstIndex);
      }
      return ignore;
    });
    console.log('ignores: \n', ignores);
    return ignores;
  }
  catch (e) {
    console.error('readEslintIgnore error: \n', e);
    return [];
  }
}

/**
 * @name isIgnorePath
 * @description 是否是要忽略的路径
 * @param {String} path 要判断的路径
 * @param {Array} ignores 忽略规则数组
 * @created 2021年01月13日15:11:18
 */
function isIgnorePath(path, ignores) {
  let isIgnore = false;
  ignores.some((ignore) => {
    try {
      const ignoreReg = new RegExp(ignore);
      isIgnore = ignoreReg.test(path);
      return isIgnore;
    }
    catch (e) {
      isIgnore = path.includes(ignore);
      return isIgnore;
    }
  });
  return isIgnore;
}

/**
 * @name getIgnoreFiles
 * @param {Array} files
 * @description 获取不校验的文件列表
 * @returns
 * @created 2021年01月15日17:02:53
 */
function getIgnoreFiles(files, folder) {
  const ignores = readEslintIgnore(folder);
  const eslintFiles = files.filter((_file) => !isIgnorePath(_file, ignores));
  let eslintJSVueFiles = isShouldEslintFiles(eslintFiles);
  return eslintJSVueFiles;
}


/**
 * @name isShouldEslintFiles
 * @param {Array} files 待处理的文件
 * @description 需要进行 eslint 格式化的文件列表
 * @returns
 * @created 2021年04月08日18:23:09
 */
function isShouldEslintFiles(files) {
  const shouldFiles = files.filter((_file) => /\.(js|vue|jsx|ts)$/.test(_file));
  return shouldFiles
}

/**
 * @name deleteDuplicateArray
 * @param {Array} array
 * @description 删除重复值
 * @returns
 * @created 2021年04月08日20:34:18
 */
function deleteDuplicateArray(array) {
  if (!array) {
    return [];
  }
  return [...new Set(array)]
}

/**
 * @name checkFileExists
 * @param {Array} files
 * @description 要检测是否存在的文件列表
 * @created 2021年04月15日17:17:06
 * @returns 存在的文件列表
 */
 async function checkFileExists(files) {
  const fileCallbacks = files.map(_file => new Promise((resolve, reject) => {
    getStat(_file)
      .then(rs => {
        resolve({ path: _file, exist: rs });
      })
      .catch(reject)
  }))
  let checkFiles = await Promise.all(fileCallbacks)
  checkFiles = checkFiles
    .filter(checkFile => checkFile.exist)
    .map(checkFile => checkFile.path);
  return checkFiles;
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

// 获取文件夹
function getFolder(_path) {
  const operateIndex = _path.lastIndexOf('/');
  const _folder = _path.substring(0, operateIndex + 1);
  return path.join(__dirname, _folder);
}

tools.readFiles = readFiles;
tools.dirExists = dirExists;
tools.execCommand = execCommand;
tools.getIgnoreFiles = getIgnoreFiles;
tools.isShouldEslintFiles = isShouldEslintFiles;
tools.deleteDuplicateArray = deleteDuplicateArray;
tools.checkFileExists = checkFileExists;
tools.writeArrayToFile = writeArrayToFile;
tools.getFolder = getFolder;

module.exports = tools;
