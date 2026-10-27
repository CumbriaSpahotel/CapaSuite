const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');
const lines = html.split('\n');
for (let i = 1670; i < 1740; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
