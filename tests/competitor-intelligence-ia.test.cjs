const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'AnalisisIA.html'), 'utf8');

test('AnalisisIA competitor intelligence strictly excludes Cumbria and Guadiana', () => {
    // Check isExternalRival logic exists and checks guadiana and cumbria
    assert.match(html, /isExternalRival/, 'AnalisisIA should define isExternalRival');
    assert.match(html, /lower\.includes\(['"]guadiana['"]\)\s*\|\|\s*lower\.includes\(['"]cumbria['"]\)/, 'isExternalRival must strictly exclude guadiana and cumbria');
});

test('AnalisisIA ignores trivial +/-10 euro differences and focuses on strategic gaps', () => {
    // Check that underpriced requires diff > 10 and diffPct
    assert.match(html, /diff > 10 && my\.price < compAvg \* 0\.85/, 'underpricedDates must ignore diff <= 10€');
    // Check that rivalStrategicChanges requires > 10€
    assert.match(html, /Math\.abs\(changeAmount\) > 10/, 'rivalStrategicChanges must ignore changes <= 10€');
});

test('AnalisisIA defines competitor insights: anomalies, changes, and profiles', () => {
    assert.match(html, /ins_comp_anomalies/, 'Should generate ins_comp_anomalies insight');
    assert.match(html, /ins_comp_changes/, 'Should generate ins_comp_changes insight');
    assert.match(html, /ins_comp_profiles/, 'Should generate ins_comp_profiles insight');
    assert.match(html, /data-cat="competitor"/, 'Should include competitor filter pill button');
});

test('openDatesModal and copyDatesModalData handle competitor anomalies and changes', () => {
    assert.match(html, /isCompAnomalies/, 'openDatesModal must handle isCompAnomalies');
    assert.match(html, /isCompChanges/, 'openDatesModal must handle isCompChanges');
    assert.match(html, /copyDatesModalData/, 'copyDatesModalData function must exist');
});

test('generateLegacyResponse handles competitor inquiries with rival intelligence', () => {
    assert.match(html, /q\.includes\('anormal'\)/, 'Chatbot handles queries about abnormal competitor behavior');
    assert.match(html, /Inteligencia Competitiva de la Plaza/, 'Legacy response includes intelligence summary');
});
