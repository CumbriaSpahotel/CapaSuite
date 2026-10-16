const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '../AnalisisCompetencia.html'), 'utf8');

function setupEnvironment() {
    const context = {
        activeHotel: 'Cumbria',
        competitorsList: [
            { name: 'Sercotel Guadiana' },
            { name: 'Hotel Santa Cecilia' },
            { name: 'El Parque Real' },
            { name: 'NH Ciudad Real' },
            { name: 'Hotel Silken' },
            { name: 'Hotel Alfonso X' }
        ],
        ignoredCompetitors: new Set(),
        ignoreCompetitorsBelowMin: false,
        useDayPartMultipliers: true,
        dayPartMultipliers: { weekday: 0, weekend: 15, sunday: -10 },
        getHotelMinPrice: (h) => (h === 'Cumbria' ? 50 : 60),
        console: { log: () => {}, warn: () => {}, error: () => {} },
        ensureHotelStructure: (d, h) => {
            if (!d.hotels) d.hotels = {};
            if (!d.hotels[h]) d.hotels[h] = { price: 0, sold: false, status: 'noData' };
        }
    };

    vm.createContext(context);

    const startYield = html.indexOf('        function calculateSmartYield(');
    const endYield = html.indexOf('\n        function setManualPrice(');
    assert.ok(startYield !== -1 && endYield !== -1, 'Could not find calculateSmartYield in HTML');
    vm.runInContext(html.slice(startYield, endYield), context);

    return context;
}

test('smart yield does not produce ping-pong recommendation loops on weekends', () => {
    const ctx = setupEnvironment();

    // Friday 30 Oct 2026 with 44% occupancy (26/59) and market avg 87€
    const dayData = {
        dayIndex: 30,
        month: 'Octubre 2026',
        dateISO: '2026-10-30',
        compAvg: 87,
        activeCompPrices: [69, 100, 83, 88, 99, 137],
        activeSoldComps: 0,
        hotels: {
            Cumbria: { price: 73, sold: false, status: 'available', otbRooms: 26 }
        }
    };

    // 1. With price at 73€, it recommends raising to 84€ (Fin Semana)
    const yieldAt73 = ctx.calculateSmartYield(dayData, 'Cumbria');
    assert.ok(yieldAt73);
    assert.equal(yieldAt73.targetPrice, 84);
    assert.match(yieldAt73.actionText, /▲ 84€ \(Fin Semana\)/);
    assert.equal(yieldAt73.canApply, true);

    // 2. When price is set to 84€ (the exact recommendation), it must be "En Rango", NOT "▼ 73€ (Estabilizar)"
    dayData.hotels.Cumbria.price = 84;
    const yieldAt84 = ctx.calculateSmartYield(dayData, 'Cumbria');
    assert.ok(yieldAt84);
    assert.equal(yieldAt84.targetPrice, 84);
    assert.equal(yieldAt84.actionText, 'En Rango');
    assert.equal(yieldAt84.canApply, false);

    // 3. When price is set to 95€ (above range), it flags as high
    dayData.hotels.Cumbria.price = 95;
    const yieldAt95 = ctx.calculateSmartYield(dayData, 'Cumbria');
    assert.ok(yieldAt95);
    assert.equal(yieldAt95.targetPrice, 84);
    assert.match(yieldAt95.actionText, /▼ 84€/);
    assert.equal(yieldAt95.canApply, true);
});
