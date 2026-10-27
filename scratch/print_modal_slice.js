const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');
const lines = html.split('\n');
for (let i = 5665; i < 5800; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
