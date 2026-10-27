const fs = require('fs');
const code = fs.readFileSync('js/pricing-intelligence.js', 'utf8');
const lines = code.split('\n');
for (let i = 675; i < 765; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
