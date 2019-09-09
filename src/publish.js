const promptList = [];

const taskList = [
  a => { console.log(a); return 'b'; },
  b => { console.log(b); return 'c'; },
  c => { console.log(c); return 'd'; },
  d => { console.log(d); return 'end'; },
];

const start = new Promise(() => { });

taskList.reduce((p, n) => {
  p.then(n);
}, start.resolve);
