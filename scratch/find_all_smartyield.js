const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');

// Find all occurrences of "function calculateSmartYield"
const regex = /function\s+calculateSmartYield/g;
let m;
while ((m = regex.exec(html)) !== null) {
    console.log('calculateSmartYield at character index:', m.index);
}
