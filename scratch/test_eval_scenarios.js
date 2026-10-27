const PI = require('../js/pricing-intelligence.js');

// Test row 27:
console.log('--- ROW 27 (Martes Oct 27, Pickup +21, Price 70, Mkt 110) ---');
const r27 = PI.evaluateDailyRecommendation({
    hotelName: 'Guadiana',
    dateISO: '2026-10-27',
    currentPrice: 70,
    marketAvg: 110,
    otbRooms: 63,
    occupancyPct: 58,
    capacity: 108,
    otbChange: 21,
    minFloorPrice: 60
});
console.log(r27);

// Test row 29:
console.log('\n--- ROW 29 (Jueves Oct 29, Price 70, Mkt 81, Occ 30%, DaysOut 2) ---');
const r29 = PI.evaluateDailyRecommendation({
    hotelName: 'Guadiana',
    dateISO: '2026-10-29',
    currentPrice: 70,
    marketAvg: 81,
    otbRooms: 32,
    occupancyPct: 30,
    capacity: 108,
    otbChange: 0,
    minFloorPrice: 60
});
console.log(r29);

// Test row 31:
console.log('\n--- ROW 31 (Sábado Oct 31, Price 100, Mkt 108, Occ 95%, DaysOut 4) ---');
const r31 = PI.evaluateDailyRecommendation({
    hotelName: 'Guadiana',
    dateISO: '2026-10-31',
    currentPrice: 100,
    marketAvg: 108,
    otbRooms: 103,
    occupancyPct: 95,
    capacity: 108,
    otbChange: 0,
    minFloorPrice: 60
});
console.log(r31);
