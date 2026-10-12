const test = require('node:test');
const assert = require('node:assert/strict');
const SegmentAnalysis = require('../js/segment-analysis.js');

test('detectGrtanteoAlerts identifies forecast days in GRTANTEO with < 15 days to arrival', () => {
    const forecastDB = {
        Guadiana: {
            segment: {
                'GRTANTEO': {
                    name: 'GRTANTEO',
                    days: {
                        '2026-10-15': { rooms: 5, accommodation: 500 },
                        '2026-10-20': { rooms: 10, accommodation: 950 },
                        '2026-11-20': { rooms: 15, accommodation: 1200 } // > 15 days away
                    }
                }
            }
        }
    };

    const res = SegmentAnalysis.detectGrtanteoAlerts({
        forecastDB,
        hotel: 'Guadiana',
        refDate: '2026-10-12',
        thresholdDays: 15
    });

    assert.equal(res.hasAlert, true);
    assert.equal(res.totalRooms, 15);
    assert.equal(res.totalRevenue, 1450);
    assert.equal(res.itemCount, 2);
    assert.equal(res.items[0].iso, '2026-10-15');
    assert.equal(res.items[0].diffDays, 3);
    assert.equal(res.items[0].isUrgent, true);
    assert.equal(res.items[1].iso, '2026-10-20');
    assert.equal(res.items[1].diffDays, 8);
    assert.deepEqual(res.affectedMonths, [9]); // October
});

test('detectGrtanteoAlerts flags expired / overdue tanteo days (diffDays < 0)', () => {
    const forecastDB = {
        Cumbria: {
            segment: {
                'GRUPO TANTEO': {
                    name: 'GRUPO TANTEO',
                    days: {
                        '2026-10-10': { rooms: 4, accommodation: 320 } // 2 days ago
                    }
                }
            }
        }
    };

    const res = SegmentAnalysis.detectGrtanteoAlerts({
        forecastDB,
        hotel: 'Cumbria',
        refDate: '2026-10-12'
    });

    assert.equal(res.hasAlert, true);
    assert.equal(res.totalRooms, 4);
    assert.equal(res.items[0].isExpired, true);
    assert.equal(res.items[0].diffDays, -2);
});

test('detectGrtanteoAlerts returns hasAlert=false when all tanteos are >= 15 days away', () => {
    const forecastDB = {
        Guadiana: {
            segment: {
                'GRTANTEO': {
                    name: 'GRTANTEO',
                    days: {
                        '2026-11-01': { rooms: 20, accommodation: 2000 } // 20 days away
                    }
                }
            }
        }
    };

    const res = SegmentAnalysis.detectGrtanteoAlerts({
        forecastDB,
        hotel: 'Guadiana',
        refDate: '2026-10-12'
    });

    assert.equal(res.hasAlert, false);
    assert.equal(res.totalRooms, 0);
    assert.equal(res.itemCount, 0);
});

test('detectGrtanteoAlerts detects monthly activity in current ongoing month when no daily data present', () => {
    const hotelData = {
        segment: {
            'GRTANTEO': {
                name: 'GRTANTEO',
                rooms: [0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0], // 8 RN in month 9 (October)
                revenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 600, 0, 0]
            }
        }
    };

    const res = SegmentAnalysis.detectGrtanteoAlerts({
        hotelData,
        hotel: 'Guadiana',
        year: '2026',
        refDate: '2026-10-12'
    });

    assert.equal(res.hasAlert, true);
    assert.equal(res.totalRooms, 8);
    assert.equal(res.items[0].month, 9);
    assert.equal(res.items[0].isMonthlyNotice, true);
});

test('AnalisisSegmentos.html contains grtanteo-global-alert and grtanteo-monthly-alert containers', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const html = fs.readFileSync(path.join(__dirname, '../AnalisisSegmentos.html'), 'utf8');
    assert.ok(html.includes('id="grtanteo-global-alert"'));
    assert.ok(html.includes('id="grtanteo-monthly-alert"'));
    assert.ok(html.includes('.grtanteo-alert-card'));
    assert.ok(html.includes('.badge-grtanteo-warning'));
});

