const fs = require('fs')
const getTemplates = require('./vue/template.js')
const getStyles = require('./vue/style.js')
const getScripts = require('./vue/script.js')
const {readFiles} = require('../utils/tool.js')

/**
 * @name readFiles
 * @description 读取指定目录下的所有文件
 * @param {*} baseDirectory 目录(相对src同级目录执行此node脚本)
 * @param {*} _files 存储所有的文件绝对路径位置
 * @created 2021年01月12日14:17:36
 */
// function readFiles(baseDirectory = '../../src', _files = []) {
//   const _dir = path.join(__dirname, baseDirectory);
//   const files = fs.readdirSync(_dir);
//   files.forEach((_file) => {
//     const _path = `${_dir}/${_file}`;
//     const data = fs.statSync(_path);
//     if (data.isFile()) {
//       _files.push(_path);
//     } else if (data.isDirectory()) {
//       readFiles(`${baseDirectory}/${_file}`, _files);
//     }
//   });
//   return _files;
// }

/**
 * @name getSingleVueInfo
 * @description 获取单个 vue 文件的信息
 * @param {String} fileDataStr 文件字符串内容
 * @created 2021年01月12日15:36:51
 */
function getSingleVueInfo(fileDataStr) {
  var fileInfo = {
    // 模板
    templates: [],
    // 脚本
    scripts: [],
    // 样式
    styles: [],
    // 其他文本, 例如注释等
    lastStr: '',
  }
  const templateInfo = getTemplates(fileDataStr)
  const scriptInfo = getScripts(templateInfo.str)
  const styleInfo = getStyles(scriptInfo.str)
  fileInfo.templates = templateInfo.array
  fileInfo.scripts = scriptInfo.array
  fileInfo.styles = styleInfo.array
  if (styleInfo.str.trim()) {
    fileInfo.lastStr = styleInfo.str.trim()
  }
  return fileInfo
}

/**
 * @name formatSingleVue
 * @description 格式化单个 vue 文件
 * @param {String} fileDataStr 文件字符串内容
 * @created 2021年01月12日15:37:16
 */
function formatSingleVue(fileDataStr) {
  const infos = getSingleVueInfo(fileDataStr)
  // console.log('infos: ', infos);
  let singleVueStr = ''
  const scripts = infos.scripts
  const templates = infos.templates
  const styles = infos.styles
  singleVueStr += infos.lastStr
  singleVueStr += '\n'
  scripts.forEach((script) => {
    singleVueStr += script
    singleVueStr += '\n'
  })
  templates.forEach((template) => {
    singleVueStr += template
    singleVueStr += '\n'
  })
  styles.forEach((style) => {
    singleVueStr += style
    singleVueStr += '\n'
  })
  singleVueStr += '\n'
  return singleVueStr
}

/**
 * @name singleOneTest
 * @description 单个 vue 文件格式化
 * @param {String} vueFile vue 文件路径
 * @created 2021年01月12日16:32:19
 */
function singleOneTest(vueFile) {
  // 2.读取文件内容
  const fileData = fs.readFileSync(vueFile, 'utf-8')
  // console.log('fileData: ', fileData);
  // 3.格式化vue文件
  const formatStr = formatSingleVue(fileData)
  // console.log('formatStr: ', formatStr);
  // 4.重新vue文件内容
  fs.writeFileSync(vueFile, formatStr, 'utf-8')
}

/**
 * @name formatVue
 * @description 格式化 vue 文件
 */
function formatVue() {
  const files = readFiles()
  // 1.查询 vue 文件
  const vueFiles = files.filter((_file) => /\.vue$/.test(_file))
  // console.log('vueFiles: ', vueFiles);
  // test: 单个文件测试
  // singleOneTest(vueFiles[0]);
  // all: 格式化所有 vue 文件
  vueFiles.forEach((vueFile) => {
    singleOneTest(vueFile)
  })
}

formatVue()
