const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');
const idx = html.indexOf('id="barMatrixModal"');
if (idx !== -1) {
    console.log(html.substring(idx - 50, idx + 1200));
} else {
    console.log('Not found');
}
