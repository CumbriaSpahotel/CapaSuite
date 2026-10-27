const fs = require('fs');
const html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');

const start = html.indexOf('function calculateSmartYield(d, hotel)');
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

console.log('calculateSmartYield start:', start, 'end:', end);
console.log('Next 100 characters after end:');
console.log(html.substring(end, end + 100));
