const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');
const start = html.indexOf('function calculateSmartYield');
// Find closing bracket of calculateSmartYield
let openCount = 0;
let inside = false;
let end = start;
for (let i = start; i < html.length; i++) {
    if (html[i] === '{') {
        openCount++;
        inside = true;
    } else if (html[i] === '}') {
        openCount--;
        if (inside && openCount === 0) {
            end = i + 1;
            break;
        }
    }
}
console.log('calculateSmartYield start:', start, 'end:', end, 'length:', end - start);
console.log(html.substring(start, start + 500));
console.log('--- END PART ---');
console.log(html.substring(end - 400, end));
