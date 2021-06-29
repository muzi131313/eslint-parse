const { getDiffFiles } = require('../utils/diff.js');
const {
  getIgnoreFiles,
  readFiles,
  checkFileExists,
  createDirNotExist
} = require('../utils/tool.js');
const { ESLint } = require('eslint');
const eslint = new ESLint();
const { log, info } = require('../utils/log.js');

async function eslintCheck(folder, isModify = true) {
  // TODO: 全部校验的逻辑
  log('[check] folder: ', folder)
  if (!folder) {
    throw new Error('check folder path was empty');
  }
  const isFolderExist = await createDirNotExist(folder, true);
  if (!isFolderExist) {
    log(`[check] folder[${folder}] not exist`)
    return;
  }
  let files
  log('[check] isModify: ', isModify)
  if (isModify) {
    files = (await getDiffFiles(folder)).filter((item) => item.includes('src/'));
  }
  else {
    files = readFiles('src');
  }
  log('[check] files: ', files);
  if (!files || !files.length) {
    info('[check] no file check')
    return;
  }

  let diffFileArray = await getIgnoreFiles(files, folder);
  let errorCount = 0;
  let warningCount = 0;
  // 过滤不存在的文件
  diffFileArray = await checkFileExists(diffFileArray);
  // log
  log('[check] diffFileArray: ', diffFileArray);
  // 执行ESLint代码检查
  const eslintResults = await eslint.lintFiles(diffFileArray);

  // 3. Format the results.
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(eslintResults);
  if (resultText) {
    info('[check] format result: ', resultText);
  }

  // 对检查结果进行处理，提取报错数和警告数
  eslintResults.forEach((result) => {
    // result的数据结构如下：
    // {
    //     filePath: "xxx/index.js",
    //     messages: [{
    //         ruleId: "semi",
    //         severity: 2,
    //         message: "Missing semicolon.",
    //         line: 1,
    //         column: 13,
    //         nodeType: "ExpressionStatement",
    //         fix: { range: [12, 12], text: ";" }
    //     }],
    //     errorCount: 1,
    //     warningCount: 1,
    //     fixableErrorCount: 1,
    //     fixableWarningCount: 0,
    //     source: "\"use strict\"\n"
    // }
    errorCount += result.errorCount;
    warningCount += result.warningCount;
    //   if (result.messages && result.messages.length) {
    //     console.log(`ESLint has found problems in file: ${result.filePath}`);
    //     result.messages.forEach((msg) => {
    //       if (msg.severity === 2) {
    //         console.log(`Error : ${msg.message} in Line ${msg.line} Column ${msg.column}`);
    //       } else {
    //         console.log(`Warning : ${msg.message} in Line ${msg.line} Column ${msg.column}`);
    //       }
    //     });
    //   }
  });
  log(`[check] total number => errors: ${errorCount}, warnings: ${warningCount}\n`);
  if (errorCount > 0) {
    process.exit(1)
  }
  info('[check] done')
}

module.exports = {
  eslintCheck
}
