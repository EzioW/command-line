const {
  runCommand,
  getCurBranch,
  readFile,
  writeFile,
  getInfoFromPackage,
  getVersionDetail,
  runInquirer,
} = require('./utils');

const curBranch = getCurBranch();

console.log(curBranch);

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
  message: 'choose publish version type',
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

const handleVersion = (version, versions, versionType) => {
  const reg = new RegExp(`${version}-${versionType}.(\\d+)?`, 'g');
  const curVersion = versions.match(reg);
  if (curVersion === null) {
    return `${version}-${versionType}.1`;
  }
  const typeVersion = curVersion[0].split('.').pop();
  return `${version}-${versionType}.${+typeVersion + 1}`;
};

const genVersion = ({ type, versionType }) => {
  const packageStr = readFile('./package.json');
  // const moduleName = getInfoFromPackage(packageStr, 'name');
  const moduleName = '@liepin/cnpm-react-form-fe';
  const versions = runCommand(`npm view ${moduleName} versions`);
  // get current stable version
  const curStableVersion = versions.match(/(\d+?\.){2}\d+?(?=')/g).pop();
  const latestVersion = versions.match(/(?<=')(.)+?(?=')/g).pop();
  let newVersion = '';

  console.log(curStableVersion, latestVersion);

  if (versionType === 'stable') { // master publish
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
    const { major, minor, patch } = getVersionDetail(latestVersion);
    if (type === 'update') {
      newVersion = handleVersion(`${+major + 1}.0.0`, versions, versionType);
    } else if (type === 'feature') {
      newVersion = handleVersion(`${major}.${+minor + 1}.0`, versions, versionType);
    } else if (type === 'bugfix') {
      newVersion = handleVersion(`${major}.${minor}.${+patch + 1}`, versions, versionType);
    }
  }

  console.log(newVersion);

  return { type, versionType, newVersion };
};

const changeFile = ({ type, versionType, newVersion }) => {
  if (versionType === 'stable') {
    let changelog = readFile('./changelog.md');
    changelog = changelog.concat(`${newVersion}\n`);
    writeFile('./changelog.md', changelog);
  }
};

runInquirer([
  typePrompt,
  versionTypePrompt,
], [
  checkOption,
  genVersion,
  changeFile,
]);
