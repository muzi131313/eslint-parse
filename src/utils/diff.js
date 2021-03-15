const path = require('path');
const { execCommand } = require('./tool.js');

const diffCommand = 'git diff';
const diffOption = '--name-only';
const currentBranchCommand = 'git symbolic-ref --short -q HEAD';

const Diff = {
  // 获取已提交到本地未 push 的 diff 文件列表
  getDiffFiles: async function(baseDir) {
    const branch = await Diff.getCurrentBranch();
    const command = Diff.generateDiffCommand(branch);
    const info = await execCommand(command);
    if (info.err) {
      throw new Error(info.err);
    }
    const dataStr = info.data;
    const datas = dataStr
      .split('\n')
      .filter((item) => item)
      .map((item) => path.join(__dirname, `${baseDir}/${item}`));
    // console.log('datas: ', datas);
    return datas;
  },
  // 获取当前分支
  getCurrentBranch: async function() {
    const branchInfo = await execCommand(currentBranchCommand);
    if (branchInfo.err) {
      throw new Error(branchInfo.err);
    }
    return branchInfo.data.replace('\n', '');
  },
  // 生成 diff 命令
  generateDiffCommand(branch) {
    const branchDiff = `"origin/${branch}" "${branch}" ${diffOption}`;
    const command = `${diffCommand} ${branchDiff}`;
    return command;
  },
};
module.exports = Diff;
