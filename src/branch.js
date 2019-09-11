const fs = require('fs');
const {
  runCommand,
  getCurBranch,
  runInquirer,
  getStableVersion,
  getVersionDetail,
  readFile,
  writeFile,
} = require('./utils');

const curBranch = getCurBranch();

if (curBranch !== 'master') {
  throw Error('create branch must be in branch master!');
}

const typePrompt = {
  type: 'list',
  name: 'type',
  message: 'choose branch type',
  choices: [
    { name: 'feature（minor）', value: 'feature' },
    { name: 'bugfix（patch）', value: 'bugfix' },
  ],
};

const branchNamePrompt = {
  type: 'input',
  name: 'branchName',
  message: 'input branch name(without branch type)',
};

const createBranch = ({ type, branchName }) => {
  const newBranchName = `${type}/${branchName}`;
  runCommand(`git branch ${newBranchName}`);
  runCommand(`git checkout ${newBranchName}`);
  runCommand(`git push --set-upstream origin ${newBranchName}`);
  return { type, newBranchName };
};

const saveBranchInfo = ({ type, newBranchName }) => {
  const stableVersion = getStableVersion();
  const [major, minor, patch] = getVersionDetail(stableVersion);
  let branchBaseVersion = '';
  switch (type) {
    case 'feature':
      branchBaseVersion = `${major}.${+minor + 1}.${patch}`;
      break;
    case 'bugfix':
      branchBaseVersion = `${major}.${minor}.${+patch + 1}`;
      break;
    default:
  }
  if (!fs.existsSync('./seraph')) {
    fs.mkdirSync('./seraph');
    const branchInfo = {};
    branchInfo[newBranchName] = [branchBaseVersion];
    writeFile('./seraph/branchInfo.json', JSON.stringify(branchInfo));
  } else {
    const branchInfo = JSON.parse(readFile('./seraph/branchInfo.json'));
    branchInfo[newBranchName] = [branchBaseVersion];
    writeFile('./seraph/branchInfo.json', JSON.stringify(branchInfo));
  }
};

runInquirer([
  typePrompt,
  branchNamePrompt,
], [
  createBranch,
  saveBranchInfo,
]);
