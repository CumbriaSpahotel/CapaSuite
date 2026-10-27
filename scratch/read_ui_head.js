const fs = require('fs');
const code = fs.readFileSync('js/competencia-intelligence-ui.js', 'utf8');
const lines = code.split('\n');
console.log('Total lines in UI:', lines.length);
for (let i = 0; i < 150; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
