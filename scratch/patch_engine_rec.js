const fs = require('fs');

let code = fs.readFileSync('js/pricing-intelligence.js', 'utf8');

const targetSection = `        // === SITUACIÓN CRÍTICA / OVERBOOKING (>95% o >100%) ===
        if (occupancyPct >= 100 || otbRooms >= capacity) {
            action = 'REVISIÓN MANUAL';
            proposedPrice = Math.max(target * 1.25, highestCompPrice > 0 ? highestCompPrice * 1.05 : target + 25);
            reasons.push(\`Hotel al 100% de capacidad (\${otbRooms}/\${capacity} habs). Proteger inventario y cerrar canales de baja rentabilidad.\`);
            riskAssessment = 'Riesgo alto de overbooking / desvíos.';
            confidenceScore = 'Muy Alta';
        }
        else if (occupancyPct >= 85) {
            action = 'SUBIR';
            const boost = (occupancyPct >= 90) ? 1.15 : 1.10;
            target = Math.max(target * boost, baseBar * 1.10);
            if (highestCompPrice > target) {
                target = Math.min(target, highestCompPrice * 0.98);
            }
            reasons.push(\`Ocupación muy alta (\${occupancyPct.toFixed(0)}%). Demanda consolidada, oportunidad de maximizar ADR.\`);
            if (p7d > 0) reasons.push(\`Pick-up positivo (+\${p7d} RN) confirma tracción de reservas.\`);
        }
        // === PICK-UP ACELERADO (MOMENTUM) ===
        else if (p7d >= 6 || p24h >= 3) {
            action = 'SUBIR';
            const pickupFactor = (p7d >= 10) ? 1.08 : 1.05;
            target = target * pickupFactor;
            reasons.push(\`Aceleración notable de ventas (Pick-up +\${p7d || p24h} RN). Ritmo superior a la media.\`);
            if (marketAvg > 0 && target < marketAvg) {
                reasons.push(\`Margen de subida respecto a la media de mercado (\${marketAvg.toFixed(0)} €).\`);
            }
        }
        // === PRESIÓN COMPETITIVA ===
        else if (soldCompsCount >= 2 && occupancyPct >= 50) {
            action = 'SUBIR';
            target = target * 1.06;
            reasons.push(\`\${soldCompsCount} hoteles competidores llenos o sin ventas abiertas en la plaza.\`);
        }
        // === OCUPACIÓN BAJA DE ÚLTIMA HORA (<7 DÍAS) - REGLA DE SEGURIDAD ===
        else if (daysOut >= 0 && daysOut <= 7 && occupancyPct < 40) {
            action = 'MANTENER';
            target = Math.max(target, minFloorPrice);
            reasons.push(\`Baja ocupación (\${occupancyPct.toFixed(0)}%) con antelación corta (\${daysOut} días). Criterio de seguridad: No bajar BAR general; activar promociones segmentadas.\`);
            riskAssessment = 'Evitar devaluación de tarifa pública de última hora.';
            confidenceScore = 'Media';
        }
        // === DEMANDA DÉBIL CON ANTELACIÓN SUFICIENTE (>21 DÍAS) ===
        else if (daysOut > 21 && occupancyPct < 25 && p7d <= 0 && p14d <= 0 && target > baseBar) {
            action = 'REVISAR BAJADA';
            target = Math.max(baseBar, target * 0.95);
            reasons.push(\`Demanda débil con antelación amplia (\${daysOut} días). Tarifa actual por encima de BAR base (\${baseBar} €) sin ritmo de reservas.\`);
        }
        // === ZONA DE ESTABILIDAD ===
        else {
            action = 'MANTENER';
            if (marketAvg > 0 && Math.abs(target - marketAvg) <= 4) {
                reasons.push(\`Tarifa alineada con el mercado (\${marketAvg.toFixed(0)} €) y ritmo de reservas estable.\`);
            } else {
                reasons.push(\`Evolución de ocupación (\${occupancyPct.toFixed(0)}%) y pickup dentro de los parámetros esperados.\`);
            }
        }`;

const replacementSection = `        let triggerText = 'En Rango';
        const bestPickup = Math.max(p24h || 0, p7d || 0);

        // === SITUACIÓN CRÍTICA / OVERBOOKING (>=100% o >=capacidad) ===
        if (occupancyPct >= 100 || otbRooms >= capacity) {
            action = 'REVISIÓN MANUAL';
            const extra = (marketAvg > target) ? Math.round((marketAvg - target) * 0.5) + 15 : 20;
            target = Math.max(target + extra, Math.round(marketAvg * 1.15));
            triggerText = '100% LLENO';
            reasons.push(\`Hotel al 100% de capacidad (\${otbRooms}/\${capacity} habs). Proteger inventario y cerrar canales de distribución.\`);
            riskAssessment = 'Riesgo alto de overbooking / desvíos.';
            confidenceScore = 'Muy Alta';
        }
        // === OCUPACIÓN MUY ALTA / ÚLTIMAS HABITACIONES (90% - 99%) ===
        else if (occupancyPct >= 90) {
            action = 'SUBIR';
            const leftRooms = Math.max(1, capacity - otbRooms);
            const gap = Math.max(0, marketAvg - target);
            const step = Math.min(22, Math.max(10, Math.round(gap * 0.40 + 8)));
            target = target + step;
            if (highestCompPrice > 0 && target > highestCompPrice * 1.15) {
                target = Math.round(highestCompPrice * 1.10);
            }
            triggerText = \`🔥 Ocup. \${occupancyPct.toFixed(0)}% (\${leftRooms} lib)\`;
            reasons.push(\`Ocupación crítica (\${occupancyPct.toFixed(0)}% · \${leftRooms} habitaciones disponibles). Proteger inventario y capturar ADR máximo.\`);
            if (bestPickup > 0) reasons.push(\`Pick-up positivo (+\${bestPickup} RN) confirma tracción.\`);
        }
        // === OCUPACIÓN ALTA (80% - 89%) ===
        else if (occupancyPct >= 80) {
            action = 'SUBIR';
            const gap = Math.max(0, marketAvg - target);
            const step = Math.min(16, Math.max(6, Math.round(gap * 0.35 + 4)));
            target = target + step;
            triggerText = \`📈 Ocup. \${occupancyPct.toFixed(0)}%\`;
            reasons.push(\`Ocupación consolidada (\${occupancyPct.toFixed(0)}%). Demanda firme, oportunidad de optimizar ADR.\`);
        }
        // === PICK-UP ACELERADO (MOMENTUM DE VENTAS) ===
        else if (bestPickup >= 5) {
            action = 'SUBIR';
            if (marketAvg > target) {
                const gap = marketAvg - target;
                const ratio = (bestPickup >= 15) ? 0.45 : ((bestPickup >= 10) ? 0.35 : 0.25);
                const step = Math.min(20, Math.max(6, Math.round(gap * ratio)));
                target = target + step;
            } else {
                const step = (bestPickup >= 10) ? 8 : 4;
                target = target + step;
            }
            triggerText = \`⚡ Pick-up +\${bestPickup} RN\`;
            reasons.push(\`Aceleración notable de reservas (Pick-up +\${bestPickup} RN). Ritmo superior a la media.\`);
            if (marketAvg > 0 && target < marketAvg) {
                reasons.push(\`Margen de subida respecto a la media de mercado (\${marketAvg.toFixed(0)} €).\`);
            }
        }
        // === PRESIÓN COMPETITIVA (COMPETIDORES LLENOS EN LA PLAZA) ===
        else if (soldCompsCount >= 2 && occupancyPct >= 45) {
            action = 'SUBIR';
            target = target + 5;
            triggerText = \`🏢 Comps llenos (\${soldCompsCount})\`;
            reasons.push(\`\${soldCompsCount} hoteles competidores llenos o sin ventas abiertas en la plaza.\`);
        }
        // === OCUPACIÓN BAJA DE ÚLTIMA HORA (<7 DÍAS) - REGLA DE SEGURIDAD REVENUE ===
        else if (daysOut >= 0 && daysOut <= 7 && occupancyPct < 40) {
            action = 'MANTENER';
            target = Math.max(target, minFloorPrice);
            triggerText = \`🛡️ Proteger ADR (\${daysOut}d)\`;
            reasons.push(\`Baja ocupación (\${occupancyPct.toFixed(0)}%) con antelación corta (\${daysOut} días). Criterio Revenue: No devaluar BAR general; mantener tarifa para proteger ADR.\`);
            riskAssessment = 'Evitar devaluación de tarifa pública de última hora.';
            confidenceScore = 'Media';
        }
        // === DEMANDA DÉBIL CON ANTELACIÓN SUFICIENTE (>21 DÍAS) ===
        else if (daysOut > 21 && occupancyPct < 25 && bestPickup <= 0 && target > baseBar) {
            action = 'REVISAR BAJADA';
            target = Math.max(baseBar, target - 4);
            triggerText = \`Antelación >21d\`;
            reasons.push(\`Demanda débil con antelación amplia (\${daysOut} días). Ajustar progresivamente hacia BAR base (\${baseBar} €).\`);
        }
        // === ZONA DE ESTABILIDAD / EN RANGO ===
        else {
            action = 'MANTENER';
            triggerText = 'En Rango';
            if (marketAvg > 0 && Math.abs(target - marketAvg) <= 4) {
                reasons.push(\`Tarifa alineada con el mercado (\${marketAvg.toFixed(0)} €) y ritmo de reservas estable.\`);
            } else {
                reasons.push(\`Evolución de ocupación (\${occupancyPct.toFixed(0)}%) y pickup dentro de los parámetros esperados.\`);
            }
        }`;

const normCode = code.replace(/\r\n/g, '\n');
const normTarget = targetSection.replace(/\r\n/g, '\n');
const normReplacement = replacementSection.replace(/\r\n/g, '\n');

if (normCode.includes(normTarget)) {
    code = normCode.replace(normTarget, normReplacement);
    
    // Also add triggerText and rangeText to return object
    const returnTarget = `            confidenceScore,
            riskAssessment,
            isException,
            eventName
        };`;
    const returnReplacement = `            confidenceScore,
            riskAssessment,
            isException,
            eventName,
            triggerText,
            minRange: Math.max(effectiveFloor, roundedProposed - 4),
            maxRange: roundedProposed + 4,
            rangeText: \`\${Math.max(effectiveFloor, roundedProposed - 4)}€ - \${roundedProposed + 4}€\`
        };`;

    const normReturnTarget = returnTarget.replace(/\r\n/g, '\n');
    const normReturnRepl = returnReplacement.replace(/\r\n/g, '\n');
    if (code.includes(normReturnTarget)) {
        code = code.replace(normReturnTarget, normReturnRepl);
        console.log('✓ Successfully updated return object with triggerText and rangeText');
    }

    fs.writeFileSync('js/pricing-intelligence.js', code, 'utf8');
    console.log('✓ Successfully updated evaluateDailyRecommendation in js/pricing-intelligence.js');
} else {
    console.error('Target section not matched in js/pricing-intelligence.js');
}
