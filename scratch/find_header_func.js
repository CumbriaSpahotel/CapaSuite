const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');

const startIdx = html.indexOf('function renderTableHeader(');
console.log('renderTableHeader startIdx:', startIdx);
const lines = html.substring(startIdx, startIdx + 3000).split('\n');
console.log(lines.slice(0, 40).join('\n'));
