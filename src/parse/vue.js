const fs = require('fs')
const getTemplates = require('./vue/template.js')
const getStyles = require('./vue/style.js')
const getScripts = require('./vue/script.js')
const { readFiles, deleteDuplicateArray } = require('../utils/tool.js')

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
function formatSingleVue(fileDataStr, formatInput) {
  const infos = getSingleVueInfo(fileDataStr)
  // console.log('infos: ', infos);
  let singleVueStr = ''
  const scripts = infos.scripts
  const templates = infos.templates
  const styles = infos.styles
  const dataObj = {
    0: scripts,
    1: templates,
    2: styles,
  }
  singleVueStr += infos.lastStr
  singleVueStr += '\n'

  formatInput.forEach(formatKey => {
    if (!dataObj[formatKey]) {
      throw new Error(`key ${formatKey} not found`);
    }
    dataObj[formatKey].forEach(formateValue => {
      singleVueStr += formateValue
      singleVueStr += '\n'
    })
  })

  // scripts.forEach((script) => {
  //   singleVueStr += script
  //   singleVueStr += '\n'
  // })
  // templates.forEach((template) => {
  //   singleVueStr += template
  //   singleVueStr += '\n'
  // })
  // styles.forEach((style) => {
  //   singleVueStr += style
  //   singleVueStr += '\n'
  // })
  singleVueStr += '\n'
  return singleVueStr
}

/**
 * @name singleOneTest
 * @description 单个 vue 文件格式化
 * @param {String} vueFile vue 文件路径
 * @created 2021年01月12日16:32:19
 */
function singleOneTest(vueFile, formatInput) {
  // 2.读取文件内容
  const fileData = fs.readFileSync(vueFile, 'utf-8')
  // console.log('fileData: ', fileData);
  // 3.格式化vue文件
  const formatStr = formatSingleVue(fileData, formatInput)
  // console.log('formatStr: ', formatStr);
  // 4.重新vue文件内容
  fs.writeFileSync(vueFile, formatStr, 'utf-8')
}

/**
 * @name formatVue
 * @description 格式化 vue 文件
 */
function formatVue(folder, formatInput) {
  formatInput = deleteDuplicateArray(formatInput);

  if (formatInput.length < 3) {
    throw new Error('fi params length less than 3');
  }

  const files = readFiles(folder)
  // 1.查询 vue 文件
  const vueFiles = files.filter((_file) => /\.vue$/.test(_file))
  // console.log('vueFiles: ', vueFiles);
  // test: 单个文件测试
  // singleOneTest(vueFiles[0]);
  // all: 格式化所有 vue 文件
  vueFiles.forEach((vueFile) => {
    singleOneTest(vueFile, formatInput)
  })
}

module.exports = {
  formatVue
}
