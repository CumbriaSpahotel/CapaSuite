const fs = require('fs');

let html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');

// 1. Add CSS for .yield-unified-pill
const cssTarget = '/* Badges de Acción del Motor */';
const newCss = `/* UNIFIED YIELD RECOMMENDATION PILL */
        .yield-unified-pill {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 5px 8px;
            border-radius: 9px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: left;
            border: 1px solid var(--border);
            background: var(--bg-surface);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            user-select: none;
            width: 100%;
            max-width: 145px;
            margin: 0 auto;
            box-sizing: border-box;
        }
        .yield-unified-pill:hover {
            transform: translateY(-1px);
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
            filter: brightness(1.02);
        }
        .yield-unified-pill.gap-cheap {
            background: rgba(16, 185, 129, 0.08);
            border-color: rgba(16, 185, 129, 0.35);
        }
        .yield-unified-pill.gap-expensive {
            background: rgba(245, 158, 11, 0.08);
            border-color: rgba(245, 158, 11, 0.35);
        }
        .yield-unified-pill.gap-critical {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.4);
        }
        .yield-unified-pill.gap-ok {
            background: var(--bg-surface);
            border-color: var(--border);
        }

        .yield-pill-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
        }
        .yield-pill-price {
            font-size: 0.92rem;
            font-weight: 800;
            color: var(--text-main);
            line-height: 1.1;
        }
        .yield-pill-diff {
            font-size: 0.7rem;
            font-weight: 800;
            padding: 1px 4px;
            border-radius: 4px;
            line-height: 1.1;
        }
        .yield-pill-diff.pos {
            background: rgba(16, 185, 129, 0.15);
            color: #059669;
        }
        .yield-pill-diff.neg {
            background: rgba(245, 158, 11, 0.15);
            color: #d97706;
        }

        .yield-pill-badge {
            font-size: 0.65rem;
            font-weight: 800;
            text-transform: uppercase;
            padding: 2px 5px;
            border-radius: 5px;
            letter-spacing: 0.3px;
            line-height: 1;
            white-space: nowrap;
        }
        .yield-pill-badge.subir {
            background: #10b981;
            color: #ffffff;
        }
        .yield-pill-badge.bajar {
            background: #f59e0b;
            color: #ffffff;
        }
        .yield-pill-badge.manual {
            background: #ef4444;
            color: #ffffff;
        }
        .yield-pill-badge.mantener {
            background: rgba(100, 116, 139, 0.15);
            color: var(--text-muted);
            border: 1px solid rgba(100, 116, 139, 0.25);
        }

        .yield-pill-sub {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.68rem;
            color: var(--text-muted);
            margin-top: 1px;
            gap: 4px;
        }
        .yield-pill-trigger {
            font-weight: 700;
            color: var(--text-main);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 80px;
        }
        .yield-pill-range {
            font-size: 0.64rem;
            color: var(--text-muted);
            white-space: nowrap;
        }

        /* Badges de Acción del Motor */`;

if (html.includes(cssTarget)) {
    html = html.replace(cssTarget, newCss);
    console.log('✓ Added unified yield pill CSS');
} else {
    console.warn('⚠️ cssTarget not found');
}

// 2. Replace calculateSmartYield function
const calcStart = html.indexOf('function calculateSmartYield(d, hotel)');
let openCount = 0;
let inside = false;
let calcEnd = calcStart;
for (let i = calcStart; i < html.length; i++) {
    if (html[i] === '{') {
        openCount++;
        inside = true;
    } else if (html[i] === '}') {
        openCount--;
        if (inside && openCount === 0) {
            calcEnd = i + 1;
            break;
        }
    }
}

const newCalcSmartYield = `function calculateSmartYield(d, hotel) {
            ensureHotelStructure(d, hotel);
            const my = d.hotels[hotel];
            const myP = (my && !my.sold) ? my.price : 0;
            const mktPrice = d.compAvg || 0;
            if (!my || my.sold || myP === 0 || mktPrice === 0) {
                return null;
            }

            const dynamic = getDynamicDateHtml(d, hotel);
            const currentOcc = (dynamic.occ > 0) ? dynamic.occ : (dynamic.otb || my.otbRooms || my.occupancy || 0);
            const cap = (hotel === 'Cumbria') ? 59 : 108;
            const occPct = (currentOcc / cap) * 100;
            const minFloor = getHotelMinPrice(hotel);
            const otbChange = (my.otbChange !== undefined) ? my.otbChange : (dynamic.pickup || 0);

            const pData = (window.PricingIntelligence) 
                ? PricingIntelligence.calculateDailyPickup(hotel, d.dateISO, { rooms: currentOcc, occupancyPct: occPct }) 
                : null;

            let compPricesArr = d.activeCompPrices || [];
            const lowestCompPrice = compPricesArr.length > 0 ? Math.min(...compPricesArr) : mktPrice;
            const highestCompPrice = compPricesArr.length > 0 ? Math.max(...compPricesArr) : mktPrice;

            const rec = (window.PricingIntelligence) ? PricingIntelligence.evaluateDailyRecommendation({
                hotelName: hotel,
                dateISO: d.dateISO,
                currentPrice: myP,
                marketAvg: mktPrice,
                lowestCompPrice: lowestCompPrice,
                highestCompPrice: highestCompPrice,
                soldCompsCount: d.activeSoldComps || 0,
                otbRooms: currentOcc,
                occupancyPct: occPct,
                capacity: cap,
                otbChange: otbChange,
                pickupData: pData,
                minFloorPrice: minFloor
            }) : null;

            if (!rec) return null;

            const targetPrice = rec.proposedPrice;
            const diffAmount = rec.diffAmount;
            const diffPct = ((myP - mktPrice) / mktPrice) * 100;
            const canApply = (diffAmount !== 0 && myP > 0);

            const minRange = rec.minRange || Math.max(minFloor || 0, targetPrice - 4);
            const maxRange = rec.maxRange || (targetPrice + 4);
            const rangeText = \`\${minRange}€ - \${maxRange}€\`;

            let actionColor = '#64748b';
            let cls = 'gap-ok';
            let actionText = 'MANTENER';

            if (rec.action === 'SUBIR') {
                actionColor = '#10b981';
                cls = 'gap-cheap';
                actionText = \`▲ \${targetPrice}€ (+\${diffAmount}€)\`;
            } else if (rec.action === 'REVISAR BAJADA') {
                actionColor = '#f59e0b';
                cls = 'gap-expensive';
                actionText = \`▼ \${targetPrice}€ (\${diffAmount}€)\`;
            } else if (rec.action === 'REVISIÓN MANUAL') {
                actionColor = '#ef4444';
                cls = 'gap-critical';
                actionText = \`⚠️ 100% LLENO\`;
            } else {
                actionColor = '#64748b';
                cls = 'gap-ok';
                actionText = \`En Rango (\${targetPrice}€)\`;
            }

            return {
                targetPrice: targetPrice,
                diffAmount: diffAmount,
                minRange: minRange,
                maxRange: maxRange,
                rangeText: rangeText,
                action: rec.action,
                actionText: actionText,
                triggerText: rec.triggerText || 'En Rango',
                actionColor: actionColor,
                cls: cls,
                diff: diffPct,
                canApply: canApply,
                fullReasonText: rec.fullReasonText,
                reasons: rec.reasons
            };
        }`;

if (calcStart !== -1 && calcEnd > calcStart) {
    html = html.substring(0, calcStart) + newCalcSmartYield + html.substring(calcEnd);
    console.log('✓ Successfully replaced calculateSmartYield with unified implementation');
} else {
    console.error('⚠️ Could not locate calculateSmartYield');
}

fs.writeFileSync('AnalisisCompetencia.html', html, 'utf8');
console.log('AnalisisCompetencia.html saved.');
