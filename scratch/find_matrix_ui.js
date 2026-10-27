const fs = require('fs');
const code = fs.readFileSync('js/competencia-intelligence-ui.js', 'utf8');
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('openBarMatrixModal') || lines[i].includes('saveBarMatrixFromModal') || lines[i].includes('matrixModalActive')) {
        console.log(`${i+1}: ${lines[i]}`);
    }
}
