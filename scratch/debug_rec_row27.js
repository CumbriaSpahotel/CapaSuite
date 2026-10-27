const PI = require('../js/pricing-intelligence.js');

const res = PI.evaluateDailyRecommendation({
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

console.log(res);
