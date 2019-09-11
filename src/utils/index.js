const fs = require('fs');
const { execSync } = require('child_process');
const inquirer = require('inquirer');

const getInfoFromPackage = (packageStr, key) => {
  const reg = new RegExp(`(?<="${key}": ")(.+)(?=")`, 'g');
  return packageStr.match(reg)[0];
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

const readFile = path => fs.readFileSync(path, 'utf-8');
const writeFile = (path, content) => fs.writeFileSync(path, content, 'utf-8');

const runInquirer = (promptList, taskList) => {
  taskList.reduce((p, n) => p.then(n), inquirer.prompt(promptList));
};

const runCommand = (command, options = {
  encoding: 'utf-8',
}) => execSync(command, options);

const getCurBranch = () => runCommand('git symbolic-ref --short -q HEAD').split('\n')[0];

module.exports = {
  runCommand,
  getCurBranch,
  getInfoFromPackage,
  getVersionDetail,
  readFile,
  writeFile,
  runInquirer,
};
