const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');
const lines = html.split('\n');
for (let i = 1350; i < 1450; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
