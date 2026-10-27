const fs = require('fs');
const code = fs.readFileSync('js/competencia-intelligence-ui.js', 'utf8');
const lines = code.split('\n');
for (let i = 680; i < 780; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
