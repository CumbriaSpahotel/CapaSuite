const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');

const idx = html.indexOf('let actionHtml = ', 194226);
console.log('Index of actionHtml:', idx);
console.log(html.substring(idx - 50, idx + 1200));
