const fs = require('fs');
const code = fs.readFileSync('js/competencia-intelligence-ui.js', 'utf8');
const lines = code.split('\n');
for (let i = 20; i < 110; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
