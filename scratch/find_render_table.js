const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');

const idx = 194226;
console.log(html.substring(idx - 100, idx + 1800));
