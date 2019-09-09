const fs = require('fs');
const { execSync } = require('child_process');
const inquirer = require('inquirer');

// const

inquirer.prompt([{
  type: 'list',
  name: 'type',
  message: '选择发布类型',
  choices: [
    { name: 'update（major）', value: 'update' },
    { name: 'feature（minor）', value: 'feature' },
    { name: 'bugfix（patch）', value: 'bugfix' },
  ],
}, {
  type: 'list',
  name: 'versionType',
  message: '选择发布版本',
  choices: [
    'alpha',
    'beta',
    'rc',
    'stable',
  ],
}]).then(({ type, versionType }) => {
  console.log(type, versionType);
  const packageJson = fs.readFileSync('./package.json', 'utf-8');
  const changeLog = fs.readFileSync('./README.md', 'utf-8');
  const moduleName = packageJson.match(/(?<="name": ")(\w.+)(?=")/g)[0];
  const versions = execSync(`npm view ${moduleName} versions`, { encoding: 'utf-8' });
  const curVersion = versions.match(/(?<=')(.)+?(?=')/g).pop();
  const version = packageJson.match(/(?<="version": ")(\w.+)(?=")/g)[0];

  if (type === 'update') { // 升级major版本

  } else if (type === 'feature') { // 新增功能，升级minor版本
    if (versionType === 'alpha') {

    } else if (versionType === 'beta') {

    }
  } else { // 修复bug 升级patch版本

  }
  // Use user feedback for... whatever!!
});
