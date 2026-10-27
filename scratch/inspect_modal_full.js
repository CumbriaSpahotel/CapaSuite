const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');
const start = html.indexOf('id="barMatrixModal"');
const end = html.indexOf('<!-- MODAL DE DETALLE DIARIO CON TIMELINE -->', start);
console.log(html.substring(start, end));
