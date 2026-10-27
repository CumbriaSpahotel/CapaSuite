const fs = require('fs');
const code = fs.readFileSync('tests/test-pricing-intelligence.js', 'utf8');
const lines = code.split('\n');
for (let i = 145; i < 170; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
