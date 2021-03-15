const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const tools = {};

/**
 * @name readFiles
 * @description 读取指定目录下的所有文件
 * @param {*} baseDirectory 目录(相对src同级目录执行此node脚本)
 * @param {*} _files 存储所有的文件绝对路径位置
 * @created 2021年01月12日14:17:36
 */
function readFiles(baseDirectory = '../../../src', _files = []) {
  const _dir = path.join(__dirname, baseDirectory);
  const files = fs.readdirSync(_dir);
  files.forEach((_file) => {
    const _path = `${_dir}/${_file}`;
    const data = fs.statSync(_path);
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
async function dirExists(dir) {
  let isExists = await getStat(dir);
  // 如果该路径且不是文件，返回true
  if (isExists && isExists.isDirectory()) {
    return true;
  } else if (isExists) {
    // 如果该路径存在但是文件，返回false
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
 * @name readEslintIgnore
 * @description 读取 .eslintignore 文件
 * @created 2021年01月13日15:10:29
 */
function readEslintIgnore() {
  const ignorePath = path.join(__dirname, '../../../.eslintignore');
  const fileData = fs.readFileSync(ignorePath, 'utf-8');
  let ignores = fileData.split('\n');
  ignores = ignores.filter((ignore) => ignore && !ignore.includes('#'));
  ignores = ignores.map((ignore) => {
    const firstIndex = ignore.indexOf('*');
    const lastIndex = ignore.lastIndexOf('*');
    if (firstIndex !== lastIndex) {
      return ignore.substring(0, firstIndex);
    }
    return ignore;
  });
  // console.log('ignores: \n', ignores);
  return ignores;
}

/**
 * @name isIgonrePath
 * @description 是否是要忽略的路径
 * @param {String} path 要判断的路径
 * @param {Array} ignores 忽略规则数组
 * @created 2021年01月13日15:11:18
 */
function isIgonrePath(path, ignores) {
  let isIgnore = false;
  ignores.some((ignore) => {
    const ignoreReg = new RegExp(ignore);
    isIgnore = ignoreReg.test(path);
    return isIgnore;
  });
  return isIgnore;
}

function getIgnoreFiles(files) {
  const ignores = readEslintIgnore();
  const eslintFiles = files.filter((_file) => !isIgonrePath(_file, ignores));
  let eslintJSVueFiles = eslintFiles.filter((_file) => /[(\.js)|(\.vue)]{1,}$/.test(_file));
  return eslintJSVueFiles;
}

tools.readFiles = readFiles;
tools.dirExists = dirExists;
tools.execCommand = execCommand;
tools.getIgnoreFiles = getIgnoreFiles;

module.exports = tools;
