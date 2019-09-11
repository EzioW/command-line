const fs = require('fs');

if (!fs.existsSync('./seraph')) {
  fs.mkdirSync('./seraph');
  const info = { 'feature/test': ['0.1.0'] };
  fs.writeFileSync('./seraph/branchInfo.json', JSON.stringify(info), { encoding: 'utf-8' });
}
