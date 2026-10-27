const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');
const lines = html.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('viewTabBtn') || lines[i].includes('view-monthly-tab') || lines[i].includes('Vista Mensual')) {
        console.log(`${i+1}: ${lines[i]}`);
    }
}
