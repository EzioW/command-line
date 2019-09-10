const {
  runCommand,
  getCurBranch,
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
};

runInquirer([
  typePrompt,
  branchNamePrompt,
], [
  createBranch,
]);
