const path = require('path');
const { execCommand } = require('./tool.js');
const { log } = require('./log.js');

const diffCommand = 'git diff';
const diffOption = '--name-only';
// 获取当前分支
const currentBranchCommand = 'git symbolic-ref --short -q HEAD';
// 获取当前提交 log[另外一种方法是（git reflog show），exec command 之后无法获取到父级分支的字符串]
const fatherBranchCommand = 'git reflog --date=local --all | grep';
// 匹配到 from father-branch to current-branch 中的 father-branch
const matchReg = /(?<=from).*?(?=to)/;

const Diff = {
  // 获取已提交到本地未 push 的 diff 文件列表
  getDiffFiles: async function(baseDir) {
    const branch = await Diff.getCurrentBranch();
    let command = Diff.generateDiffCommand(branch);
    let info = await execCommand(command);
    if (info.err) {
      // throw new Error(info.err);
      const errorStr = info.err.toString()
      if (errorStr.includes('unknown revision')) {
        // console.error(info.err);
        const fatherBranch = await Diff.getFatherBranch(branch);
        command = Diff.generateDiffFatherCommand(branch, fatherBranch);
        info = await execCommand(command);
      }
      else {
        console.error(errorStr);
        return [];
      }
    }
    const dataStr = info.data;
    log('[diff] dataStr: ', dataStr)
    const diffFiles = dataStr
      .split('\n')
      .filter((item) => item)
      .map((item) => `${baseDir}/${item}`);
    log('[diff] diffFiles: ', diffFiles);
    return diffFiles;
  },
  // 获取当前分支
  getCurrentBranch: async function() {
    const branchInfo = await execCommand(currentBranchCommand);
    if (branchInfo.err) {
      throw new Error(branchInfo.err);
    }
    return branchInfo.data.replace('\n', '');
  },
  // 获取父分支
  getFatherBranch: async function(currentBranch) {
    try {
      const getFatherBranchCommand = `${fatherBranchCommand} ${currentBranch}`;
      const fatherBranchInfo = await execCommand(getFatherBranchCommand);
      if (fatherBranchInfo.err) {
        console.error(fatherBranchInfo.err);
        return null;
      }
      const data = fatherBranchInfo.data;
      if (!data) {
        console.warn('get father branch failed, data was null');
        return null;
      }
      const branchData = data.split('\n');
      const createLogIndex = branchData.findIndex(item => item.includes('Created from HEAD'))
      if (createLogIndex === -1) {
        console.warn('get father branch failed, could not find created head log');
        return null;
      }
      const beforeCreateLog = branchData[createLogIndex + 1];
      if (!beforeCreateLog) {
        console.warn('get father branch failed, before create log was null');
        return null;
      }
      const matches =  beforeCreateLog.match(matchReg)
      if (!matches) {
        console.warn('get father branch failed, match get null');
        return null;
      }
      let fatherBranch = matches[0];
      if (fatherBranch) {
        // 去除空格
        fatherBranch = fatherBranch.replace(/ /g, '');
      }
      return fatherBranch;
    }
    catch (e) {
      console.error(e);
      return null;
    }
  },
  // 生成 diff 命令
  generateDiffCommand(branch) {
    const branchDiff = `"origin/${branch}" "${branch}" ${diffOption}`;
    const command = `${diffCommand} ${branchDiff}`;
    return command;
  },
  // 生成 diff 父分支的 命令
  generateDiffFatherCommand(branch, fatherBranch) {
    const branchDiff = `"origin/${fatherBranch}" "${branch}" ${diffOption}`;
    const command = `${diffCommand} ${branchDiff}`;
    return command;
  },
};
module.exports = Diff;
