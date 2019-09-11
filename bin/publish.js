const {
  getCurBranch,
  readFile,
  writeFile,
  getInfoFromPackage,
  getVersionDetail,
  runInquirer,
  runCommand,
} = require('./utils');

const curBranch = getCurBranch();
const isMaster = curBranch === 'master';

const branchInfoPath = './seraph/branchInfo.json';
const packagePath = './package.json';
let branchInfo = {};
try {
  branchInfo = JSON.parse(readFile(branchInfoPath));
} catch {
  console.error('can not find branch versions info , make sure this branch is created by seraph command line');
}

let versions = '';
let branchs = [];
if (isMaster) {
  branchs = runCommand('git branch').match(/(\w+)\/(\w+)|\w+/g).filter(item => item !== 'master');
  if (branchs.length === 0) {
    throw Error('no branch can be published now');
  }
} else {
  versions = branchInfo[curBranch];
  if (versions === undefined) {
    throw Error('can not find branch versions info , make sure this branch is created by seraph command line');
  }
}

const branchBaseVersion = versions.slice(0, 1)[0];
const latestVersion = versions.slice(-1)[0];

const packageStr = readFile(packagePath);
const curStableVersion = getInfoFromPackage(packageStr, 'version');

const typeList = [
  { name: 'feature（minor）', value: 'feature' },
  { name: 'bugfix（patch）', value: 'bugfix' },
];

const typePrompt = {
  type: 'list',
  name: 'type',
  message: 'choose publish type',
  choices: typeList.slice(1, 3),
  when: () => !isMaster,
};

const branchPrompt = {
  type: 'list',
  name: 'branch',
  message: 'choose publish branch nmae',
  choices: branchs,
  when: () => isMaster,
};

const versionTypePrompt = {
  type: 'list',
  name: 'versionType',
  message: 'choose publish version type',
  choices: [
    'alpha',
    'beta',
    'rc',
  ],
  when: () => !isMaster,
};

const fixEmptyVersion = (version, versionType) => {
  const reg = new RegExp(`${version}-${versionType}.(\\d+)?`, 'g');
  const curVersion = versions.toString().match(reg);
  if (curVersion === null) {
    return `${version}-${versionType}.1`;
  }
  const typeVersion = curVersion[0].split('.').pop();
  return `${version}-${versionType}.${+typeVersion + 1}`;
};

const genVersion = ({ type, branch, versionType }) => {
  let newVersion = '';

  if (isMaster) { // master publish
    const { major, minor, patch } = getVersionDetail(curStableVersion);
    newVersion = '';
    switch (branch.split('/')[0]) {
      case 'update':
        newVersion = `${+major + 1}.0.0`;
        break;
      case 'feature':
        newVersion = `${major}.${+minor + 1}.0`;
        break;
      case 'bugfix':
        newVersion = `${major}.${minor}.${+patch + 1}`;
        break;
      default:
    }
  } else { // branch publish
    const { major, minor, patch } = getVersionDetail(branchBaseVersion);
    const { minor: latestMinor } = getVersionDetail(latestVersion);
    const haveUpdated = latestMinor !== minor;
    if (type === 'feature') {
      newVersion = fixEmptyVersion(`${major}.${haveUpdated ? +latestMinor + 1 : +minor + 1}.0`, versionType);
    } else if (type === 'bugfix') {
      newVersion = fixEmptyVersion(`${major}.${latestMinor}.${haveUpdated ? 1 : +patch + 1}`, versionType);
    }
  }
  return { branch, newVersion };
};

const changeFile = ({ branch, newVersion }) => {
  let changelog = readFile('./changelog.md');
  changelog = changelog.concat(`## ${newVersion}\n\n`);
  writeFile('./changelog.md', changelog);
  if (isMaster) {
    delete branchInfo[branch];
    writeFile(branchInfoPath, JSON.stringify(branchInfo));
    const newPackage = packageStr.replace(/(?<="version": ")(.+)(?=")/g, () => newVersion);
    writeFile(packagePath, newPackage);
  } else {
    branchInfo[curBranch].push(newVersion);
    writeFile(branchInfoPath, JSON.stringify(branchInfo));
  }
  return newVersion;
};

const publish = newVersion => {
  // const published = runCommand('npm publish');
  // console.log(published);
  // runCommand(`git add . && git commit -m 'publish version ${newVersion}' && git push`);
  console.info(`publish version${newVersion}`);
};

runInquirer([
  typePrompt,
  branchPrompt,
  versionTypePrompt,
], [
  genVersion,
  changeFile,
  publish,
]);
