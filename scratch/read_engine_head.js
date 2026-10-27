const fs = require('fs');
const code = fs.readFileSync('js/pricing-intelligence.js', 'utf8');
const lines = code.split('\n');
console.log('Total lines:', lines.length);
for (let i = 0; i < 120; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
