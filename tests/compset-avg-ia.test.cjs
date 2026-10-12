const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'AnalisisIA.html'), 'utf8');

test('AnalisisIA uses official compAvg from AnalisisCompetencia and respects ignored_competitors', () => {
    // Check that ignoredComps is instantiated and compAvg uses d.compAvg
    assert.match(html, /ignored_competitors/, 'AnalisisIA must check ignored_competitors');
    assert.match(html, /let compAvg = \(d\.compAvg && d\.compAvg > 0\)/, 'AnalisisIA must prioritize d.compAvg');
});
