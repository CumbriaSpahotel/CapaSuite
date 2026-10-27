const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');
const lines = html.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('class="app-header"') || lines[i].includes('openBarMatrixModal')) {
        console.log(`${i+1}: ${lines[i]}`);
    }
}
