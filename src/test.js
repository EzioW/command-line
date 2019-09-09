const {
  readFile,
  getInfoFromPackage,
  getVersionDetail,
  runInquirer,
} = require('./utils');

const typePrompt = {
  type: 'list',
  name: 'type',
  message: '选择分支类型',
  choices: [
    { name: 'feature（minor）', value: 'feature' },
    { name: 'bugfix（patch）', value: 'bugfix' },
  ],
};

const versionPrompt = {
  type: 'list',
  name: 'versionType',
  message: '选择发布版本',
  choices: [
    'alpha',
    'beta',
  ],
};

const genVersion = ({ type, versionType }) => {
  const packageStr = readFile('./package.json');
  const curVersion = getInfoFromPackage(packageStr, 'version');
  console.log(curVersion);
};

runInquirer([typePrompt, versionPrompt], [
  genVersion,
]);
