const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'Analisis360.html'), 'utf8');

test('HTML structure displays Producción por Servicio for the donut chart', () => {
    assert.match(html, /<h3[^>]*>[\s\S]*Producción por Servicio[\s\S]*<\/h3>/, 'Service chart header must say Producción por Servicio');
    assert.doesNotMatch(html, /<h3[^>]*>[\s\S]*Ingresos de habitaciones[\s\S]*<\/h3>/, 'Ingresos de habitaciones chart header should be replaced');
});

test('renderCharts populates serviceChart with multi-service mix (Habitación, Restaurante, Desayunos, etc.)', () => {
    const updatedCharts = {};
    const ctx = vm.createContext({
        currentHotel: 'Guadiana',
        currentYear: '2026',
        currentMonth: 'All',
        currentViewMode: 'projected',
        charts: {},
        updateChart: (id, type, labels, data, colors) => {
            updatedCharts[id] = { type, labels, data, colors };
        },
        document: {
            getElementById: (id) => ({
                getContext: () => ({ createLinearGradient: () => ({ addColorStop: () => {} }) }),
                style: {},
                innerHTML: '',
                innerText: ''
            })
        },
        CapaStorage: { getItem: () => null, setItem: () => {} },
        fmt: (v) => Math.round(v).toLocaleString('es-ES') + ' €',
        fmtNum: (v) => Math.round(v).toLocaleString('es-ES'),
        normalizeSegmentDisplayName: (n) => String(n || '').trim().toUpperCase(),
        normalizeStr: (s) => String(s || '').toUpperCase().trim(),
        db: {
            'Guadiana': {
                '2026': {
                    service: {
                        'HABITACION': { name: 'HABITACION DOBLE', revenue: [10000, ...Array(11).fill(0)], rooms: [100, ...Array(11).fill(0)] },
                        'DESAYUNO': { name: 'DESAYUNO BUFFET', revenue: [2000, ...Array(11).fill(0)], rooms: [0, ...Array(11).fill(0)] },
                        'RESTAURANTE': { name: 'RESTAURANTE CATERING', revenue: [3000, ...Array(11).fill(0)], rooms: [0, ...Array(11).fill(0)] }
                    },
                    otb: { revenue: Array(12).fill(0), rooms: Array(12).fill(0), breakdown: {} }
                }
            }
        }
    });

    vm.runInContext(fs.readFileSync(path.join(root, 'js/production-groups.js'), 'utf8'), ctx);
    vm.runInContext(html.slice(html.indexOf('        function getGroupedProduction('), html.indexOf('        function renderKPIRow(')), ctx);
    vm.runInContext(html.slice(html.indexOf('        function segmentRoomRevenue('), html.indexOf('        function renderTables(')), ctx);

    const yearData = ctx.db['Guadiana']['2026'];
    const agg = ctx.aggregateServices(yearData, -1, 'projected');
    ctx.renderCharts(agg, {}, {}, -1, yearData);

    const sc = updatedCharts['serviceChart'];
    assert.ok(sc, 'serviceChart should be updated');
    assert.equal(sc.type, 'doughnut');
    // Ensure multiple departments are in the labels
    const labelString = sc.labels.join(' | ');
    assert.match(labelString, /Habitación/i);
    assert.match(labelString, /Desayunos/i);
    assert.match(labelString, /Restaurante/i);
    assert.ok(sc.data.length >= 3, 'Should have multiple department slices');
});

test('renderTables populates servicesTable with all departments breakdown', () => {
    const tableBody = { innerHTML: '' };
    const ctx = vm.createContext({
        currentHotel: 'Guadiana',
        currentYear: '2026',
        currentMonth: 'All',
        currentViewMode: 'projected',
        document: {
            getElementById: (id) => {
                if (id === 'servicesBody') return tableBody;
                return { innerHTML: '', innerText: '', style: {} };
            }
        },
        CapaStorage: { getItem: () => null, setItem: () => {} },
        fmt: (v) => Math.round(v).toLocaleString('es-ES') + ' €',
        fmtNum: (v) => Math.round(v).toLocaleString('es-ES'),
        normalizeSegmentDisplayName: (n) => String(n || '').trim().toUpperCase(),
        normalizeStr: (s) => String(s || '').toUpperCase().trim(),
        GROUP_TO_CATEGORY: {
            'HABITACION': 'Habitaciones',
            'DESAYUNOS': 'Restauración',
            'RESTAURANTE': 'Restauración'
        },
        db: {
            'Guadiana': {
                '2026': {
                    service: {
                        'HABITACION': { name: 'HABITACION DOBLE', revenue: [10000, ...Array(11).fill(0)], rooms: [100, ...Array(11).fill(0)] },
                        'DESAYUNO': { name: 'DESAYUNO BUFFET', revenue: [2000, ...Array(11).fill(0)], rooms: [0, ...Array(11).fill(0)] },
                        'RESTAURANTE': { name: 'RESTAURANTE CATERING', revenue: [3000, ...Array(11).fill(0)], rooms: [0, ...Array(11).fill(0)] }
                    }
                }
            }
        }
    });

    vm.runInContext(fs.readFileSync(path.join(root, 'js/production-groups.js'), 'utf8'), ctx);
    vm.runInContext(html.slice(html.indexOf('        function getGroupedProduction('), html.indexOf('        function renderKPIRow(')), ctx);
    vm.runInContext(html.slice(html.indexOf('        function segmentRoomRevenue('), html.indexOf('        function renderCharts(')), ctx);
    vm.runInContext(html.slice(html.indexOf('        function renderTables('), html.indexOf('        function toggleComplementarySection(')), ctx);

    const yearData = ctx.db['Guadiana']['2026'];
    const agg = ctx.aggregateServices(yearData, -1, 'projected');
    ctx.renderTables(agg, {}, -1, yearData);

    assert.ok(tableBody.innerHTML.includes('HABITACION DOBLE'));
    assert.ok(tableBody.innerHTML.includes('DESAYUNO BUFFET'));
    assert.ok(tableBody.innerHTML.includes('RESTAURANTE CATERING'));
});
