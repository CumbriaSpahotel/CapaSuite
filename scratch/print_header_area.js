const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');
const lines = html.split('\n');
for (let i = 1570; i < 1640; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
