const {
  // runCommand,
  getCurBranch,
  readFile,
  writeFile,
  getInfoFromPackage,
  getVersionDetail,
  runInquirer,
} = require('./utils');

const curBranch = getCurBranch();
const isMaster = curBranch === 'master';

const branchInfoPath = './seraph/branchInfo.json';
let branchInfo = {};
try {
  branchInfo = JSON.parse(readFile(branchInfoPath));
} catch {
  console.error('can not find branch versions info , make sure this branch is created by seraph command line');
}

const versions = branchInfo[curBranch];
if (versions === undefined) {
  throw Error('can not find branch versions info , make sure this branch is created by seraph command line');
}

const branchBaseVersion = versions.slice(0, 1)[0];
const latestVersion = versions.slice(-1)[0];

const packageStr = readFile('./package.json');
// // const moduleName = getInfoFromPackage(packageStr, 'name');
// const moduleName = '@liepin/cnpm-react-form-fe';
// const versionsStr = runCommand(`npm view ${moduleName} versions`);
// const versionsList = versionsStr.match(/(\d+?\.){2}\d+?((-\w+)?.\d+?)?(?=')/g);
// // let changelog = readFile('./changelog.md');
// // const versions = changelog.match(/(?<=## )(.+)?/g);
// // get current stable version
// const curStableVersion = versionsStr.match(/(\d+?\.){2}\d+?(?=')/g).pop();
// const latestVersion = versionsList.pop();
const curStableVersion = getInfoFromPackage(packageStr, 'version'); // changelog.match(/(\d+?\.){2}\d+?\n/g).pop();
// // const latestVersion = changelog.match(/(?<=## )(.+)?/g).pop();

// console.log(curStableVersion, latestVersion, versionsList);
// console.log([...new Set(versionsList.filter(item => item > curStableVersion).map(item => item.split('-')[0]))]);

const typeList = [
  { name: 'update（major）', value: 'update' },
  { name: 'feature（minor）', value: 'feature' },
  { name: 'bugfix（patch）', value: 'bugfix' },
];

const typePrompt = {
  type: 'list',
  name: 'type',
  message: 'choose publish type',
  choices: isMaster ? typeList : typeList.slice(1, 3),
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

// const featureListPrompt = {
//   type: 'list',
//   name: 'feature',
//   message: 'choose feature for bug fix',
//   choices: [...new Set(versionsList.filter(item => item > curStableVersion).map(item => item.split('-')[0]))],
//   when: ({ type }) => type === 'bugfix',
// };

const checkOption = ({ type, versionType }) => {
  const isMasterErr = isMaster && versionType !== 'stable';
  const isBranchErr = !isMaster && versionType === 'stable';
  if (isMasterErr || isBranchErr) {
    throw Error('stable version only can be published in branch master!');
  } else {
    return { type, versionType };
  }
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

const genVersion = ({ type, versionType }) => {
  let newVersion = '';

  if (isMaster) { // master publish
    const { major, minor, patch } = getVersionDetail(curStableVersion);
    newVersion = '';
    switch (type) {
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

  return { newVersion };
};

const changeFile = ({ newVersion }) => {
  let changelog = readFile('./changelog.md');
  changelog = changelog.concat(`## ${newVersion}\n\n`);
  writeFile('./changelog.md', changelog);
  if (isMaster) {
    delete branchInfo[curBranch];
    writeFile(branchInfoPath, JSON.stringify(branchInfo));
  }
  branchInfo[curBranch].push(newVersion);
  writeFile(branchInfoPath, JSON.stringify(branchInfo));
};

runInquirer([
  typePrompt,
  versionTypePrompt,
  // featureListPrompt,
], [
  checkOption,
  genVersion,
  changeFile,
]);
