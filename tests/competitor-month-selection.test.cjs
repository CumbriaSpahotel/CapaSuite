const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../AnalisisCompetencia.html'), 'utf8');
const start = html.indexOf('        function populateMonths()');
const end = html.indexOf('        // --- RENDER ---', start);
assert.ok(start >= 0 && end > start);

function setup(value) {
    const selector = {
        value,
        get innerHTML() { return this.markup || ''; },
        set innerHTML(markup) {
            this.markup = markup;
            // Rebuilding a native select resets its selection to the first option.
            this.value = 'all';
        }
    };
    const context = vm.createContext({
        document: { getElementById: () => selector },
        distinctMonths: ['Octubre 2026', 'Septiembre 2027']
    });
    vm.runInContext(html.slice(start, end), context);
    return { selector, context };
}

test('automatic data refresh preserves September 2027 across repeated selector rebuilds', () => {
    const { selector, context } = setup('Septiembre 2027');
    context.populateMonths();
    context.populateMonths();
    assert.equal(selector.value, 'Septiembre 2027');
});

test('annual view remains selected after refresh', () => {
    const { selector, context } = setup('all');
    context.populateMonths();
    assert.equal(selector.value, 'all');
});

test('removed month falls back to annual view', () => {
    const { selector, context } = setup('Septiembre 2027');
    context.distinctMonths = ['Octubre 2026'];
    context.populateMonths();
    assert.equal(selector.value, 'all');
});
