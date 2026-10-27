const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');

const idx = html.indexOf('html += `<td>${actionHtml}</td>`;', 198572);
console.log('Index of actionHtml cell insertion:', idx);
console.log(html.substring(idx - 100, idx + 500));
