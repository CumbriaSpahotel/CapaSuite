const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');
const lines = html.split('\n');
for (let i = 1430; i < 1480; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
