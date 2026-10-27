const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');
const lines = html.split('\n');
let inside = false;
let startLine = 0;
let modalLines = [];
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="barMatrixModal"')) {
        inside = true;
        startLine = i + 1;
    }
    if (inside) {
        modalLines.push(`${i+1}: ${lines[i]}`);
        if (lines[i].includes('<!-- MODAL DE DETALLE DIARIO CON TIMELINE -->')) {
            break;
        }
    }
}
console.log(`Start line: ${startLine}, total lines: ${modalLines.length}`);
console.log(modalLines.slice(0, 50).join('\n'));
console.log('--- END OF PREVIEW ---');
console.log(modalLines.slice(-30).join('\n'));
