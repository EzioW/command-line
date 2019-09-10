const {
  runCommand,
  getCurBranch,
  readFile,
  // writeFile,
  getInfoFromPackage,
  getVersionDetail,
  runInquirer,
} = require('./utils');

const curBranch = getCurBranch();

const typePrompt = {
  type: 'list',
  name: 'type',
  message: 'choose publish type',
  choices: [
    { name: 'update（major）', value: 'update' },
    { name: 'feature（minor）', value: 'feature' },
    { name: 'bugfix（patch）', value: 'bugfix' },
  ],
};

const versionTypePrompt = {
  type: 'list',
  name: 'versionType',
  message: '选择发布版本',
  choices: [
    'alpha',
    'beta',
    'rc',
    'stable',
  ],
};

const checkOption = ({ type, versionType }) => {
  const isMasterErr = curBranch === 'master' && versionType !== 'stable';
  const isBranchErr = curBranch !== 'master' && versionType === 'stable';
  if (isMasterErr || isBranchErr) {
    throw Error('stable version only can be published in branch master!');
  } else {
    return { type, versionType };
  }
};

const genVersion = ({ type, versionType }) => {
  const packageStr = readFile('./package.json');
  const moduleName = getInfoFromPackage(packageStr, 'name');
  const versions = runCommand(`npm view ${moduleName} versions`);
  // get current stable version
  const curVersion = versions.match(/(?<=')(.)+?(?=')/g).pop();
  const { major, minor, patch } = getVersionDetail(curVersion);
  let newVersion = '';

  if (versionType === 'stable') { // master publish
    newVersion = '';
    switch (type) {
      case 'update':
        newVersion = `${major + 1}.${minor}.${patch}`;
        break;
      case 'feature':
        newVersion = `${major}.${minor + 1}.${patch}`;
        break;
      case 'bugfix':
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
      default:
    }
  } else { // branch publish
    if (type === 'update') {

    }
  }

  return newVersion;
};

// const changeFile = version => {

// };

runInquirer([
  typePrompt,
  versionTypePrompt,
], [
  checkOption,
  genVersion,
  // changeFile,
]);
