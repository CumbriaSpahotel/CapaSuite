const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');

const target = 'th-active-hotel';
// find SECOND occurrence
const idx = html.indexOf(target, 30000);
console.log('Second index of th-active-hotel:', idx);
const lines = html.substring(idx - 200, idx + 800).split('\n');
console.log(lines.join('\n'));
