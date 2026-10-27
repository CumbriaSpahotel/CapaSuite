const fs = require('fs');
const code = fs.readFileSync('js/pricing-intelligence.js', 'utf8');
const lines = code.split('\n');
for (let i = 610; i < 760; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
