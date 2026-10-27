const fs = require('fs');

let html = fs.readFileSync('AnalisisCompetencia.html', 'utf8');

// 1. Update th-action header
const oldTh = 'h += `<th class="th-market">Mercado</th><th class="th-gap">Gap</th><th class="th-action" style="white-space:nowrap;">Recomendación</th>`;\n            if (cfg.diffPrice) h += `<th class="th-diff-price" style="text-align:center; white-space:nowrap;">Var.</th>`;\n            if (cfg.recReason) h += `<th class="th-rec-reason" style="text-align:center; white-space:nowrap;">Motivo</th>`;';

const newTh = 'h += `<th class="th-market">Mercado</th><th class="th-gap">Gap</th><th class="th-action" style="min-width:140px; text-align:center; white-space:nowrap;">Recomendación y Yield</th>`;';

const normHtml = html.replace(/\r\n/g, '\n');
const normOldTh = oldTh.replace(/\r\n/g, '\n');

if (normHtml.includes(normOldTh)) {
    html = normHtml.replace(normOldTh, newTh);
    console.log('✓ Replaced table header action column');
} else {
    console.warn('⚠️ oldTh not matched directly, trying regex');
    html = normHtml.replace(/h\s*\+=\s*`<th class="th-market">Mercado<\/th><th class="th-gap">Gap<\/th><th class="th-action"[^>]*>Recomendación<\/th>`;\s*(?:if\s*\(cfg\.diffPrice\)[^;]+;\s*)?(?:if\s*\(cfg\.recReason\)[^;]+;\s*)?/, newTh);
    console.log('✓ Replaced table header via regex');
}

// 2. Update actionHtml construction
const startActionHtml = html.indexOf('if (!sold && myP > 0 && d.compAvg > 0) {\n                    const yieldInfo = calculateSmartYield(d, activeHotel);');

const oldActionBlock = `                if (!sold && myP > 0 && d.compAvg > 0) {
                    const yieldInfo = calculateSmartYield(d, activeHotel);
                    if (yieldInfo) {
                        gapHtml = \`<span class="gap-badge \${yieldInfo.cls}">\${yieldInfo.diff > 0 ? '+' : ''}\${yieldInfo.diff.toFixed(0)}%</span>\`;
                        const rangeTag = yieldInfo.rangeText ? \`<span class="action-range-text">\${yieldInfo.rangeText}</span>\` : '';
                        if (yieldInfo.canApply) {
                            actionHtml = \`<button class="action-badge-btn clickable" 
                                style="color:\${yieldInfo.actionColor}; border-color:\${yieldInfo.actionColor}40; background:\${yieldInfo.actionColor}12;" 
                                onclick="setManualPrice(\${d.dayIndex}, '\${activeHotel}', \${yieldInfo.targetPrice})" 
                                title="Click para aplicar recomendación de \${yieldInfo.targetPrice}€ a \${activeHotel} (Rango sugerido: \${yieldInfo.rangeText})">
                                <span class="action-main-text">\${yieldInfo.actionText}</span>
                                \${rangeTag}
                            </button>\`;
                        } else {
                            actionHtml = \`<span class="action-badge-btn" style="color:\${yieldInfo.actionColor}; font-weight:700;">
                                <span class="action-main-text">\${yieldInfo.actionText}</span>
                                \${rangeTag}
                            </span>\`;
                        }
                    }
                }`;

const newActionBlock = `                if (!sold && myP > 0 && d.compAvg > 0) {
                    const yieldInfo = calculateSmartYield(d, activeHotel);
                    if (yieldInfo) {
                        gapHtml = \`<span class="gap-badge \${yieldInfo.cls}">\${yieldInfo.diff > 0 ? '+' : ''}\${yieldInfo.diff.toFixed(0)}%</span>\`;
                        const actCls = yieldInfo.action === 'SUBIR' ? 'subir' : (yieldInfo.action === 'REVISAR BAJADA' ? 'bajar' : (yieldInfo.action === 'REVISIÓN MANUAL' ? 'manual' : 'mantener'));
                        const diffBadge = (yieldInfo.diffAmount !== 0) 
                            ? \`<span class="yield-pill-diff \${yieldInfo.diffAmount > 0 ? 'pos' : 'neg'}">\${yieldInfo.diffAmount > 0 ? '+' : ''}\${yieldInfo.diffAmount}€</span>\` 
                            : '';

                        const applyClick = yieldInfo.canApply 
                            ? \`onclick="setManualPrice(\${d.dayIndex}, '\${activeHotel}', \${yieldInfo.targetPrice})"\` 
                            : \`onclick="CompetenciaIntelUI.openDayDetailModal('\${d.dateISO}')"\`;
                        const applyTitle = yieldInfo.canApply 
                            ? \`Click para aplicar recomendación de \${yieldInfo.targetPrice}€ a \${activeHotel}\\n\\nMotivo:\\n\${yieldInfo.fullReasonText}\` 
                            : \`Tarifa actual óptima (\${yieldInfo.targetPrice}€).\\n\\nMotivo:\\n\${yieldInfo.fullReasonText}\`;

                        actionHtml = \`
                            <div class="yield-unified-pill \${yieldInfo.cls}" \${applyClick} title="\${applyTitle}">
                                <div class="yield-pill-top">
                                    <span class="yield-pill-price">\${yieldInfo.targetPrice} €</span>
                                    \${diffBadge}
                                    <span class="yield-pill-badge \${actCls}">\${yieldInfo.action}</span>
                                </div>
                                <div class="yield-pill-sub">
                                    <span class="yield-pill-trigger" title="\${yieldInfo.triggerText}">\${yieldInfo.triggerText}</span>
                                    <span class="yield-pill-range">\${yieldInfo.rangeText}</span>
                                </div>
                            </div>
                        \`;
                    }
                }`;

const normOldAction = oldActionBlock.replace(/\r\n/g, '\n');
const normNewAction = newActionBlock.replace(/\r\n/g, '\n');

if (html.includes(normOldAction)) {
    html = html.replace(normOldAction, normNewAction);
    console.log('✓ Replaced actionHtml construction block');
} else {
    console.warn('⚠️ Could not match normOldAction directly');
}

// 3. Update insertion of actionHtml and remove redundant diffPrice/recReason in row
const oldInsertBlock = `html += \`<td>\${actionHtml}</td>\`;

                if (cfg.diffPrice) {
                    const diffAmt = rec ? rec.diffAmount : 0;
                    const diffColor = diffAmt > 0 ? '#10b981' : (diffAmt < 0 ? '#f59e0b' : 'var(--text-muted)');
                    html += \`<td style="text-align:center; font-weight:700; font-size:0.8rem; color:\${diffColor}; white-space:nowrap;">\${diffAmt !== 0 ? (diffAmt > 0 ? '+' : '') + diffAmt + ' €' : '-'}</td>\`;
                }
                if (cfg.recReason) {
                    const actCls = rec ? (rec.action === 'SUBIR' ? 'subir' : (rec.action === 'REVISAR BAJADA' ? 'bajar' : (rec.action === 'REVISIÓN MANUAL' ? 'manual' : 'mantener'))) : 'mantener';
                    const actText = rec ? rec.action : 'MANTENER';
                    html += \`<td style="text-align:center; white-space:nowrap;" title="\${rec ? rec.fullReasonText : ''}"><span class="action-pill \${actCls}">\${actText}</span></td>\`;
                }`;

const newInsertBlock = `html += \`<td style="text-align:center; padding:4px 6px; vertical-align:middle;">\${actionHtml}</td>\`;`;

const normOldInsert = oldInsertBlock.replace(/\r\n/g, '\n');
const normNewInsert = newInsertBlock.replace(/\r\n/g, '\n');

if (html.includes(normOldInsert)) {
    html = html.replace(normOldInsert, normNewInsert);
    console.log('✓ Replaced actionHtml insertion and removed redundant columns');
} else {
    console.warn('⚠️ Could not match normOldInsert directly');
}

fs.writeFileSync('AnalisisCompetencia.html', html, 'utf8');
console.log('AnalisisCompetencia.html written successfully.');
