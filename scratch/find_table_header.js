const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');

const target = 'th-active-hotel';
const idx = html.indexOf(target);
console.log('Index of th-active-hotel:', idx);
const lines = html.substring(idx - 200, idx + 800).split('\n');
console.log(lines.join('\n'));
