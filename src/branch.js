const {
  runCommand,
  getCurBranch,
  readFile,
  getInfoFromPackage,
  getVersionDetail,
  runInquirer,
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

// const versionPrompt = {
//   type: 'list',
//   name: 'versionType',
//   message: 'choose version type',
//   choices: [
//     'alpha',
//     'beta',
//   ],
// };

const branchNamePrompt = {
  type: 'input',
  name: 'branchName',
  message: 'input branch name(without branch type)',
};

const genVersion = ({ type, branchName }) => {
  const packageStr = readFile('./package.json');
  const curVersion = getInfoFromPackage(packageStr, 'version');
};

const createBranch = ({ type, branchName }) => {
  const newBranchName = `${type}/${branchName}`;
  runCommand(`git branch ${newBranchName}`);
  runCommand(`git checkout ${newBranchName}`);
};

runInquirer([
  typePrompt,
  branchNamePrompt,
], [
  // genVersion,
  createBranch,
]);
