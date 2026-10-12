const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'Analisis360.html'), 'utf8');

test('HTML structure replaces Produccion de habitaciones with Presupuesto progress table', () => {
    assert.doesNotMatch(html, /<span>Producción de habitaciones<\/span>/, 'Producción de habitaciones card header should be removed');
    assert.match(html, /<span>Presupuesto · ¿Cómo vamos\?<\/span>/, 'Presupuesto card header should be present');
    assert.match(html, /id="budgetProgressTable"/, 'budgetProgressTable must be present');
    assert.match(html, /id="budgetProgressBody"/, 'budgetProgressBody must be present');
    assert.match(html, /id="realSegmentsTable"/, 'realSegmentsTable must remain present');
    assert.match(html, /id="realSegmentsBody"/, 'realSegmentsBody must remain present');
});

test('renderTables renders Top Segmentos and Budget tracking properly', () => {
    const ctx = vm.createContext({
        currentHotel: 'Guadiana',
        currentYear: '2026',
        currentMonth: 'All',
        currentViewMode: 'projected',
        document: {
            getElementById: (id) => {
                if (!ctx._elements[id]) {
                    ctx._elements[id] = { innerHTML: '', innerText: '', style: {} };
                }
                return ctx._elements[id];
            }
        },
        _elements: {},
        CapaStorage: {
            getItem: (key) => null,
            setItem: () => {}
        },
        fmt: (v) => Math.round(v).toLocaleString('es-ES') + ' €',
        fmtNum: (v) => Math.round(v).toLocaleString('es-ES'),
        normalizeSegmentDisplayName: (n) => String(n || '').trim().toUpperCase(),
        normalizeStr: (s) => String(s || '').toUpperCase().trim(),
        getGroupID: (n) => 'HABITACION',
        GROUP_TO_CATEGORY: { 'HABITACION': 'Habitaciones' },
        db: {
            'Guadiana': {
                '2026': {
                    service: {
                        'HABITACION DOBLE': { name: 'HABITACION DOBLE', revenue: [10000, ...Array(11).fill(0)], rooms: [100, ...Array(11).fill(0)] }
                    },
                    segment: {
                        'DIRECTO ONLINE': {
                            name: 'DIRECTO ONLINE',
                            revenue: [6000, ...Array(11).fill(0)],
                            accommodation: [6000, ...Array(11).fill(0)],
                            rooms: [60, ...Array(11).fill(0)]
                        },
                        'CORPORATIVO': {
                            name: 'CORPORATIVO',
                            revenue: [4000, ...Array(11).fill(0)],
                            accommodation: [4000, ...Array(11).fill(0)],
                            rooms: [40, ...Array(11).fill(0)]
                        }
                    }
                }
            }
        }
    });

    vm.runInContext(fs.readFileSync(path.join(root, 'js/production-groups.js'), 'utf8'), ctx);
    vm.runInContext(html.slice(html.indexOf('        function getGroupedProduction('), html.indexOf('        function renderKPIRow(')), ctx);
    vm.runInContext(html.slice(html.indexOf('        function segmentRoomRevenue('), html.indexOf('        function renderCharts(')), ctx);
    vm.runInContext(html.slice(html.indexOf('        function renderTables('), html.indexOf('        function toggleComplementarySection(')), ctx);

    const agg = ctx.aggregateServices(ctx.db['Guadiana']['2026'], -1, 'projected');
    ctx.renderTables(agg, ctx.db['Guadiana']['2026'].segment, -1);

    // Verify Top Segmentos populated
    const segBody = ctx._elements['realSegmentsBody'];
    assert.ok(segBody.innerHTML.includes('DIRECTO ONLINE'), 'Top Segmentos should display DIRECTO ONLINE');
    assert.ok(segBody.innerHTML.includes('CORPORATIVO'), 'Top Segmentos should display CORPORATIVO');
    assert.ok(segBody.innerHTML.includes('60 RN'), 'Top Segmentos should display room nights');

    // Verify Budget progress populated
    const budgetBody = ctx._elements['budgetProgressBody'];
    assert.ok(budgetBody.innerHTML.includes('Ingresos Hab.'), 'Budget table should show Ingresos Hab.');
    assert.ok(budgetBody.innerHTML.includes('Precio Medio (ADR)'), 'Budget table should show ADR');
    assert.ok(budgetBody.innerHTML.includes('Desglose Mensual vs Presupuesto'), 'Annual view should show monthly breakdown vs budget');
});
