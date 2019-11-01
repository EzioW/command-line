const fs = require('fs');
const { execSync } = require('child_process');
const inquirer = require('inquirer');

const readFile = path => fs.readFileSync(path, 'utf-8');

const writeFile = (path, content) => fs.writeFileSync(path, content, 'utf-8');

const runCommand = (command, options = {
  encoding: 'utf-8',
}) => execSync(command, options);

const runInquirer = (promptList, taskList) => taskList.reduce((p, n) => p.then(n), inquirer.prompt(promptList));

const getCurBranch = () => runCommand('git symbolic-ref --short -q HEAD').split('\n')[0];

const getInfoFromPackage = (packageStr, key) => {
  const reg = new RegExp(`(?<="${key}": ")(.+)(?=")`, 'g');
  return packageStr.match(reg)[0];
};

const getStableVersion = () => {
  const packageStr = readFile('./package.json');
  const moduleName = getInfoFromPackage(packageStr, 'name');
  const versionsStr = runCommand(`npm view ${moduleName} versions`);
  const curStableVersion = versionsStr.match(/(\d+?\.){2}\d+?(?=')/g).pop();
  return curStableVersion;
};

const getVersionDetail = version => {
  const [main] = version.split('-');
  const [major, minor, patch] = main.split('.');
  // const [type, subVersion] = sub.split('.');
  return {
    major,
    minor,
    patch,
    // type,
    // subVersion,
  };
};

module.exports = {
  runCommand,
  getCurBranch,
  getInfoFromPackage,
  getStableVersion,
  getVersionDetail,
  readFile,
  writeFile,
  runInquirer,
};
