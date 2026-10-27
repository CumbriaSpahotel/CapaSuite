const fs = require('fs');
let code = fs.readFileSync('js/pricing-intelligence.js', 'utf8');
code = code.replace(
    'No devaluar BAR general; mantener tarifa para proteger ADR.',
    'No bajar BAR general; mantener tarifa para proteger ADR.'
);
fs.writeFileSync('js/pricing-intelligence.js', code, 'utf8');
console.log('✓ Updated safety rule wording in js/pricing-intelligence.js');
