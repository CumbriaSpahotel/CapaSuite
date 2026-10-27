// Prototype updated evaluateDailyRecommendation logic
function testRec(params) {
    const {
        hotelName = 'Guadiana',
        dateISO,
        currentPrice = 70,
        marketAvg = 110,
        lowestCompPrice = 0,
        highestCompPrice = 0,
        soldCompsCount = 0,
        otbRooms = 63,
        occupancyPct = 58,
        capacity = 108,
        pickupData = null,
        otbChange = 0,
        minFloorPrice = 60
    } = params;

    let baseBar = 72;
    let target = currentPrice > 0 ? currentPrice : baseBar;
    let action = 'MANTENER';
    let triggerText = 'En Rango';
    let reasons = [];

    const p24h = (pickupData?.h24h?.available) ? pickupData.h24h.diffRooms : otbChange;
    const p7d = (pickupData?.d7?.available) ? pickupData.d7.diffRooms : otbChange;
    const bestPickup = Math.max(p24h || 0, p7d || 0);

    const today = new Date(); today.setHours(0,0,0,0);
    const targetDt = new Date(dateISO);
    const daysOut = Math.ceil((targetDt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (occupancyPct >= 100 || otbRooms >= capacity) {
        action = 'REVISIÓN MANUAL';
        target = Math.max(target + 25, Math.round(marketAvg * 1.20));
        triggerText = '100% LLENO';
        reasons.push(`Hotel al 100% (${otbRooms}/${capacity} habs). Cerrar ventas.`);
    } else if (occupancyPct >= 90) {
        action = 'SUBIR';
        const gap = Math.max(0, marketAvg - target);
        const step = Math.min(25, Math.max(12, Math.round(gap * 0.45 + 10)));
        target = target + step;
        triggerText = `🔥 Ocup. ${occupancyPct.toFixed(0)}% (${capacity - otbRooms} lib)`;
        reasons.push(`Ocupación crítica (${occupancyPct.toFixed(0)}%). Proteger últimas habitaciones.`);
    } else if (occupancyPct >= 80) {
        action = 'SUBIR';
        const gap = Math.max(0, marketAvg - target);
        const step = Math.min(18, Math.max(8, Math.round(gap * 0.35 + 5)));
        target = target + step;
        triggerText = `📈 Ocup. ${occupancyPct.toFixed(0)}%`;
        reasons.push(`Ocupación consolidada (${occupancyPct.toFixed(0)}%). Oportunidad de subir ADR.`);
    } else if (bestPickup >= 5) {
        action = 'SUBIR';
        if (marketAvg > target) {
            const gap = marketAvg - target;
            const ratio = (bestPickup >= 15) ? 0.45 : ((bestPickup >= 10) ? 0.35 : 0.25);
            const step = Math.min(22, Math.max(6, Math.round(gap * ratio)));
            target = target + step;
        } else {
            const step = (bestPickup >= 10) ? 8 : 5;
            target = target + step;
        }
        triggerText = `⚡ Pick-up +${bestPickup} RN`;
        reasons.push(`Aceleración notable de ventas (+${bestPickup} RN).`);
    } else if (soldCompsCount >= 2 && occupancyPct >= 50) {
        action = 'SUBIR';
        target = target + 6;
        triggerText = `🏢 Comps llenos (${soldCompsCount})`;
        reasons.push(`${soldCompsCount} hoteles competidores llenos.`);
    } else if (daysOut >= 0 && daysOut <= 7 && occupancyPct < 40) {
        action = 'MANTENER';
        triggerText = `🛡️ Proteger ADR (${daysOut}d)`;
        reasons.push(`Baja ocupación a corto plazo (${daysOut}d). Proteger ADR.`);
    } else if (daysOut > 21 && occupancyPct < 25 && p7d <= 0 && target > baseBar) {
        action = 'REVISAR BAJADA';
        target = Math.max(baseBar, target - 4);
        triggerText = `Antelación >21d`;
        reasons.push(`Demanda débil con antelación amplia.`);
    } else {
        action = 'MANTENER';
        triggerText = 'En Rango';
        reasons.push(`Tarifa alineada con el mercado.`);
    }

    if (minFloorPrice > 0 && target < minFloorPrice) {
        target = minFloorPrice;
        action = 'SUBIR';
        triggerText = 'Suelo Mínimo';
    }

    const proposed = Math.round(target);
    const diff = proposed - currentPrice;
    const minRange = Math.max(minFloorPrice || 0, proposed - 4);
    const maxRange = proposed + 4;

    return {
        action,
        proposedPrice: proposed,
        currentPrice,
        diffAmount: diff,
        triggerText,
        rangeText: `${minRange}€ - ${maxRange}€`,
        reasons
    };
}

// Check row 27
console.log('Row 27:', testRec({
    dateISO: '2026-10-27',
    currentPrice: 70,
    marketAvg: 110,
    otbRooms: 63,
    occupancyPct: 58,
    otbChange: 21
}));

// Check row 28
console.log('Row 28:', testRec({
    dateISO: '2026-10-28',
    currentPrice: 70,
    marketAvg: 86,
    otbRooms: 46,
    occupancyPct: 43,
    otbChange: 13
}));

// Check row 29
console.log('Row 29:', testRec({
    dateISO: '2026-10-29',
    currentPrice: 70,
    marketAvg: 81,
    otbRooms: 32,
    occupancyPct: 30,
    otbChange: 0
}));

// Check row 31
console.log('Row 31:', testRec({
    dateISO: '2026-10-31',
    currentPrice: 100,
    marketAvg: 108,
    otbRooms: 103,
    occupancyPct: 95,
    otbChange: 0
}));
