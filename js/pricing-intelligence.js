/**
 * CapaSuite - Pricing Intelligence Engine
 * Módulo independiente de Inteligencia de Precios, Históricos de Pick-up y Yield Management.
 * Sercotel Guadiana / Hotel Cumbria
 */

(function (root) {
    'use strict';

    // 1. CONFIGURACIÓN Y MATRIZ BASE 2027 (SERCOTEL GUADIANA)
    // Meses (1-12) y días de la semana (1: Lunes .. 7: Domingo)
    // 0: Domingo en JS Date, aquí normalizamos a índices estándar 1 (Lunes) .. 7 (Domingo) y 0 (Domingo)
    const DEFAULT_BAR_MATRIX_2027 = {
        1:  { name: "Enero",      1: 62, 2: 64, 3: 64, 4: 62, 5: 70, 6: 75, 7: 58 },
        2:  { name: "Febrero",    1: 62, 2: 64, 3: 64, 4: 62, 5: 70, 6: 75, 7: 58 },
        3:  { name: "Marzo",      1: 66, 2: 68, 3: 68, 4: 66, 5: 73, 6: 78, 7: 60 },
        4:  { name: "Abril",      1: 72, 2: 74, 3: 74, 4: 72, 5: 78, 6: 85, 7: 64 },
        5:  { name: "Mayo",       1: 68, 2: 70, 3: 70, 4: 68, 5: 75, 6: 85, 7: 62 },
        6:  { name: "Junio",      1: 68, 2: 70, 3: 70, 4: 68, 5: 75, 6: 85, 7: 62 },
        7:  { name: "Julio",      1: 66, 2: 68, 3: 68, 4: 66, 5: 75, 6: 78, 7: 60 },
        8:  { name: "Agosto",     1: 68, 2: 70, 3: 70, 4: 68, 5: 75, 6: 80, 7: 62 },
        9:  { name: "Septiembre", 1: 72, 2: 74, 3: 74, 4: 72, 5: 78, 6: 85, 7: 64 },
        10: { name: "Octubre",    1: 72, 2: 74, 3: 74, 4: 72, 5: 78, 6: 85, 7: 64 },
        11: { name: "Noviembre",  1: 66, 2: 68, 3: 68, 4: 66, 5: 73, 6: 78, 7: 60 },
        12: { name: "Diciembre",  1: 62, 2: 64, 3: 64, 4: 62, 5: 70, 6: 75, 7: 58 }
    };

    // Escalado por ocupación para Enero y Febrero (Referencia Excel)
    const DEFAULT_OCC_TIERS_JAN_FEB = [
        { minOcc: 0,  maxOcc: 20, price: 62 },
        { minOcc: 21, maxOcc: 30, price: 62 },
        { minOcc: 31, maxOcc: 40, price: 62 },
        { minOcc: 41, maxOcc: 50, price: 62 },
        { minOcc: 51, maxOcc: 60, price: 62 },
        { minOcc: 61, maxOcc: 70, price: 70 },
        { minOcc: 71, maxOcc: 80, price: 75 },
        { minOcc: 81, maxOcc: 90, price: 85 },
        { minOcc: 91, maxOcc: 95, price: 95 },
        { minOcc: 96, maxOcc: 100, price: 110 }
    ];

    const STORAGE_KEY_MATRIX = 'capasuite_pricing_matrix_2027_v1';
    const STORAGE_KEY_TIERS_JAN_FEB = 'capasuite_occ_tiers_jan_feb_v1';
    const STORAGE_KEY_SNAPSHOTS = 'daily_otb_snapshots_v1';
    const STORAGE_KEY_EXCEPTIONS = 'capasuite_pricing_exceptions_v1';

    const DOW_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const DOW_SHORT_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const MONTH_NAMES_ES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Helper de almacenamiento seguro
    function getStoredItem(key) {
        try {
            if (typeof CapaStorage !== 'undefined' && CapaStorage.getItem) {
                return CapaStorage.getItem(key);
            }
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem(key);
            }
        } catch (e) {
            console.warn('[PricingIntelligence] Error al leer storage:', key, e);
        }
        return null;
    }

    function setStoredItem(key, val) {
        try {
            if (typeof CapaStorage !== 'undefined' && CapaStorage.setItem) {
                CapaStorage.setItem(key, val);
                return true;
            }
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, val);
                return true;
            }
        } catch (e) {
            console.warn('[PricingIntelligence] Error al escribir storage:', key, e);
        }
        return false;
    }

    // =========================================================================
    // 2. GESTIÓN DE MATRIZ DE PRECIOS EDITABLE (12 MESES X 7 DÍAS)
    // =========================================================================
    function getBarMatrix() {
        const raw = getStoredItem(STORAGE_KEY_MATRIX);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object' && parsed[1]) {
                    return parsed;
                }
            } catch (e) {
                console.warn('[PricingIntelligence] Error parseando matriz almacenada, usando default:', e);
            }
        }
        return JSON.parse(JSON.stringify(DEFAULT_BAR_MATRIX_2027));
    }

    function saveBarMatrix(matrix) {
        if (!matrix || typeof matrix !== 'object') return false;
        return setStoredItem(STORAGE_KEY_MATRIX, JSON.stringify(matrix));
    }

    function resetBarMatrixToDefault() {
        return saveBarMatrix(DEFAULT_BAR_MATRIX_2027);
    }

    function getOccTiersJanFeb() {
        const raw = getStoredItem(STORAGE_KEY_TIERS_JAN_FEB);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {}
        }
        return JSON.parse(JSON.stringify(DEFAULT_OCC_TIERS_JAN_FEB));
    }

    function saveOccTiersJanFeb(tiers) {
        if (!Array.isArray(tiers)) return false;
        return setStoredItem(STORAGE_KEY_TIERS_JAN_FEB, JSON.stringify(tiers));
    }

    // =========================================================================
    // 3. EXCEPCIONES TARIFARIAS Y FECHAS ESPECIALES
    // =========================================================================
    function getPricingExceptions() {
        const raw = getStoredItem(STORAGE_KEY_EXCEPTIONS);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') return parsed;
            } catch (e) {}
        }
        return {};
    }

    function savePricingExceptions(exceptions) {
        if (!exceptions || typeof exceptions !== 'object') return false;
        return setStoredItem(STORAGE_KEY_EXCEPTIONS, JSON.stringify(exceptions));
    }

    function setDateException(dateISO, data) {
        const all = getPricingExceptions();
        if (!data) {
            delete all[dateISO];
        } else {
            all[dateISO] = {
                barBase: Number(data.barBase) || 0,
                minPrice: Number(data.minPrice) || null,
                notes: String(data.notes || ''),
                eventName: String(data.eventName || ''),
                updatedAt: new Date().toISOString()
            };
        }
        return savePricingExceptions(all);
    }

    // Obtener la BAR base para una fecha específica (YYYY-MM-DD)
    function getBaseBarForDate(dateISO) {
        if (!dateISO || typeof dateISO !== 'string') return 64;
        
        // 1. Comprobar si existe excepción tarifaria específica
        const exceptions = getPricingExceptions();
        if (exceptions[dateISO] && exceptions[dateISO].barBase > 0) {
            return {
                bar: exceptions[dateISO].barBase,
                isException: true,
                eventName: exceptions[dateISO].eventName || '',
                notes: exceptions[dateISO].notes || ''
            };
        }

        const parts = dateISO.split('-');
        if (parts.length !== 3) return { bar: 64, isException: false };

        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        
        const dt = new Date(year, month - 1, day);
        let dow = dt.getDay(); // 0 = Domingo, 1 = Lunes .. 6 = Sábado
        let matrixDowKey = dow === 0 ? 7 : dow; // Normalizamos: 1=Lun, 7=Dom

        const matrix = getBarMatrix();
        const mRow = matrix[month];
        if (mRow && mRow[matrixDowKey] !== undefined) {
            return {
                bar: Number(mRow[matrixDowKey]),
                isException: false,
                dowName: DOW_NAMES_ES[dow],
                monthName: MONTH_NAMES_ES[month - 1]
            };
        }

        return { bar: 64, isException: false };
    }

    // =========================================================================
    // 4. HISTÓRICO DE SNAPSHOTS MULTI-HORIZONTE (DEDUPLICACIÓN Y PERSISTENCIA)
    // =========================================================================
    // Estructura:
    // {
    //   "Guadiana": {
    //      "2027-03-20": [
    //         { date: "2027-02-15", timestamp: 1771142400000, rooms: 25, revenue: 1650, adr: 66, occ: 23.1 },
    //         { date: "2027-02-22", timestamp: 1771747200000, rooms: 35, revenue: 2380, adr: 68, occ: 32.4 }, ...
    //      ]
    //   }
    // }

    function getSnapshotsDB() {
        const raw = getStoredItem(STORAGE_KEY_SNAPSHOTS);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') return parsed;
            } catch (e) {
                console.warn('[PricingIntelligence] Error al parsear snapshots DB:', e);
            }
        }
        return { Guadiana: {}, Cumbria: {} };
    }

    function saveSnapshotsDB(db) {
        if (!db || typeof db !== 'object') return false;
        return setStoredItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(db));
    }

    /**
     * Registra una captura (snapshot) del estado actual para una fecha de estancia.
     * Deduplica por fecha de captura (YYYY-MM-DD): si ya existe captura el mismo día,
     * actualiza la entrada sin duplicar.
     */
    function recordDailySnapshot(hotelName, dateISO, metrics, captureDate = new Date()) {
        if (!hotelName || !dateISO || !metrics) return false;
        const db = getSnapshotsDB();
        db[hotelName] = db[hotelName] || {};
        db[hotelName][dateISO] = db[hotelName][dateISO] || [];

        const capDt = (captureDate instanceof Date) ? captureDate : new Date(captureDate);
        const captureDayKey = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(capDt);
        const timestamp = capDt.getTime();

        const entry = {
            captureDate: captureDayKey,
            timestamp: timestamp,
            rooms: Math.round(Number(metrics.rooms) || 0),
            revenue: Number(metrics.revenue) || 0,
            adr: (metrics.rooms > 0 && metrics.revenue > 0) ? (metrics.revenue / metrics.rooms) : (Number(metrics.adr) || 0),
            occupancyPct: Number(metrics.occupancyPct) || 0
        };

        const list = db[hotelName][dateISO];
        const existingIdx = list.findIndex(item => item.captureDate === captureDayKey);
        if (existingIdx >= 0) {
            // Actualizar entrada del mismo día evitando duplicados
            list[existingIdx] = entry;
        } else {
            list.push(entry);
        }

        // Ordenar cronológicamente por timestamp ascendente
        list.sort((a, b) => a.timestamp - b.timestamp);

        // Limitar a máximo 90 capturas por fecha de estancia para optimizar espacio
        if (list.length > 90) {
            db[hotelName][dateISO] = list.slice(-90);
        }

        return saveSnapshotsDB(db);
    }

    /**
     * Sincroniza en masa el estado actual de OTB desde hotel_manager_db_v2 o processedData
     * asegurando que exista snapshot de hoy para todas las fechas sin duplicaciones.
     */
    function captureBatchSnapshots(hotelName, dailyMap, captureDate = new Date()) {
        if (!hotelName || !dailyMap || typeof dailyMap !== 'object') return 0;
        const db = getSnapshotsDB();
        db[hotelName] = db[hotelName] || {};

        const capDt = (captureDate instanceof Date) ? captureDate : new Date(captureDate);
        const captureDayKey = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(capDt);
        const timestamp = capDt.getTime();
        const capacity = (hotelName === 'Cumbria') ? 59 : 108;

        let count = 0;
        Object.entries(dailyMap).forEach(([iso, val]) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
            const rooms = Math.round(typeof val === 'object' ? (val.rooms ?? val.otbRooms ?? 0) : Number(val) || 0);
            const revenue = typeof val === 'object' ? (val.revenue ?? 0) : 0;
            const adr = (rooms > 0 && revenue > 0) ? (revenue / rooms) : (typeof val === 'object' ? (val.adr || 0) : 0);
            const occPct = (rooms / capacity) * 100;

            db[hotelName][iso] = db[hotelName][iso] || [];
            const list = db[hotelName][iso];
            const entry = {
                captureDate: captureDayKey,
                timestamp: timestamp,
                rooms: rooms,
                revenue: revenue,
                adr: adr,
                occupancyPct: occPct
            };

            const existingIdx = list.findIndex(item => item.captureDate === captureDayKey);
            if (existingIdx >= 0) {
                list[existingIdx] = entry;
            } else {
                list.push(entry);
            }

            if (list.length > 90) {
                db[hotelName][iso] = list.slice(-90);
            }
            count++;
        });

        if (count > 0) {
            saveSnapshotsDB(db);
        }
        return count;
    }

    /**
     * Obtiene los horizontes de pick-up (24h, 3d, 7d, 14d, 30d) para una fecha de estancia.
     * Retorna { available: true/false, ... } indicando cuándo no hay histórico suficiente.
     */
    function calculateDailyPickup(hotelName, dateISO, currentMetrics = null, referenceDate = new Date()) {
        const result = {
            dateISO: dateISO,
            current: { rooms: 0, revenue: 0, adr: 0, occPct: 0 },
            h24h: { available: false, diffRooms: 0, diffRev: 0, adrPickup: 0, diffOccPct: 0, label: 'Sin histórico suficiente' },
            d3:   { available: false, diffRooms: 0, diffRev: 0, adrPickup: 0, diffOccPct: 0, label: 'Sin histórico suficiente' },
            d7:   { available: false, diffRooms: 0, diffRev: 0, adrPickup: 0, diffOccPct: 0, label: 'Sin histórico suficiente' },
            d14:  { available: false, diffRooms: 0, diffRev: 0, adrPickup: 0, diffOccPct: 0, label: 'Sin histórico suficiente' },
            d30:  { available: false, diffRooms: 0, diffRev: 0, adrPickup: 0, diffOccPct: 0, label: 'Sin histórico suficiente' },
            snapshotsCount: 0
        };

        const db = getSnapshotsDB();
        const list = (db[hotelName] && db[hotelName][dateISO]) ? db[hotelName][dateISO] : [];
        result.snapshotsCount = list.length;

        // Determinar métrica actual
        let current = null;
        if (currentMetrics && currentMetrics.rooms !== undefined) {
            current = {
                rooms: Math.round(Number(currentMetrics.rooms) || 0),
                revenue: Number(currentMetrics.revenue) || 0,
                adr: (currentMetrics.rooms > 0 && currentMetrics.revenue > 0) 
                    ? (currentMetrics.revenue / currentMetrics.rooms) 
                    : (Number(currentMetrics.adr) || 0),
                occupancyPct: Number(currentMetrics.occupancyPct) || 0
            };
        } else if (list.length > 0) {
            current = list[list.length - 1];
        }

        if (!current) return result;
        result.current = current;

        // Si no hay histórico previo, no fabricar pickup
        if (list.length === 0) {
            return result;
        }

        const refTime = (referenceDate instanceof Date) ? referenceDate.getTime() : new Date(referenceDate).getTime();
        const MS_PER_DAY = 24 * 60 * 60 * 1000;

        // Horizontes a evaluar: objetivo en días, rango mínimo y máximo de tolerancia en días
        const horizons = [
            { key: 'h24h', targetDays: 1,  minDays: 0.5, maxDays: 1.8 },
            { key: 'd3',   targetDays: 3,  minDays: 2.0, maxDays: 4.5 },
            { key: 'd7',   targetDays: 7,  minDays: 5.0, maxDays: 9.0 },
            { key: 'd14',  targetDays: 14, minDays: 11.0, maxDays: 18.0 },
            { key: 'd30',  targetDays: 30, minDays: 24.0, maxDays: 38.0 }
        ];

        horizons.forEach(h => {
            // Buscar la captura más cercana al horizonte ideal
            let bestMatch = null;
            let bestDeltaMs = Infinity;

            list.forEach(snap => {
                const ageDays = (refTime - snap.timestamp) / MS_PER_DAY;
                if (ageDays >= h.minDays && ageDays <= h.maxDays) {
                    const delta = Math.abs(ageDays - h.targetDays);
                    if (delta < bestDeltaMs) {
                        bestDeltaMs = delta;
                        bestMatch = snap;
                    }
                }
            });

            // Fallback: si list tiene al menos 2 elementos y estamos pidiendo 24h pero la diferencia es menor o igual a 2 días
            if (!bestMatch && h.key === 'h24h' && list.length >= 2) {
                // Tomar la captura inmediatamente anterior
                const prev = list[list.length - 2];
                const ageDays = (refTime - prev.timestamp) / MS_PER_DAY;
                if (ageDays <= 2.5) {
                    bestMatch = prev;
                }
            }

            if (bestMatch) {
                const diffRooms = current.rooms - bestMatch.rooms;
                const diffRev = current.revenue - bestMatch.revenue;
                const adrPickup = (diffRooms !== 0 && diffRev !== 0) ? (diffRev / diffRooms) : 0;
                const diffOccPct = current.occupancyPct - bestMatch.occupancyPct;

                result[h.key] = {
                    available: true,
                    diffRooms: diffRooms,
                    diffRev: diffRev,
                    adrPickup: adrPickup,
                    diffOccPct: diffOccPct,
                    baselineRooms: bestMatch.rooms,
                    baselineDate: bestMatch.captureDate,
                    label: `${diffRooms >= 0 ? '+' : ''}${diffRooms} RN`
                };
            } else {
                result[h.key] = {
                    available: false,
                    diffRooms: 0,
                    diffRev: 0,
                    adrPickup: 0,
                    diffOccPct: 0,
                    label: 'Sin histórico suficiente'
                };
            }
        });

        return result;
    }

    // =========================================================================
    // 5. MOTOR DE RECOMENDACIÓN DIARIA INTELIGENTE
    // =========================================================================
    /**
     * Evalúa una fecha y produce una recomendación fundamentada.
     * Acciones: SUBIR | MANTENER | REVISAR BAJADA | REVISIÓN MANUAL
     */
    function evaluateDailyRecommendation(params) {
        const {
            hotelName = 'Guadiana',
            dateISO,
            currentPrice = 0,
            marketAvg = 0,
            lowestCompPrice = 0,
            highestCompPrice = 0,
            soldCompsCount = 0,
            otbRooms = 0,
            occupancyPct = 0,
            capacity = (hotelName === 'Cumbria' ? 59 : 108),
            pickupData = null,
            minFloorPrice = 60,
            customEvent = null
        } = params;

        // 1. Obtener BAR base de referencia (Excel 2027) o excepción
        const baseInfo = getBaseBarForDate(dateISO);
        let baseBar = baseInfo.bar;
        const isException = baseInfo.isException;
        const eventName = customEvent?.name || baseInfo.eventName || '';

        // Extraer fecha y antelación
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let daysOut = 999;
        let monthNum = 1;
        let dow = 1;

        if (dateISO && dateISO.includes('-')) {
            const parts = dateISO.split('-');
            const yr = parseInt(parts[0], 10);
            monthNum = parseInt(parts[1], 10);
            const dy = parseInt(parts[2], 10);
            const targetDt = new Date(yr, monthNum - 1, dy);
            dow = targetDt.getDay(); // 0 = Domingo
            daysOut = Math.ceil((targetDt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        // 2. Escalado por ocupación (Enero y Febrero)
        let occTierRefPrice = null;
        if (monthNum === 1 || monthNum === 2) {
            const tiers = getOccTiersJanFeb();
            const matchingTier = tiers.find(t => occupancyPct >= t.minOcc && occupancyPct <= t.maxOcc);
            if (matchingTier) {
                occTierRefPrice = matchingTier.price;
            }
        }

        // 3. Evaluar Pick-up
        const p7d = pickupData?.d7?.available ? pickupData.d7.diffRooms : (pickupData?.h24h?.available ? pickupData.h24h.diffRooms : 0);
        const p24h = pickupData?.h24h?.available ? pickupData.h24h.diffRooms : 0;
        const p14d = pickupData?.d14?.available ? pickupData.d14.diffRooms : 0;

        // 4. Lógica de Decisión
        let action = 'MANTENER';
        let proposedPrice = currentPrice > 0 ? currentPrice : baseBar;
        let reasons = [];
        let riskAssessment = 'Riesgo bajo';
        let confidenceScore = 'Alta';

        // Ancla de partida: baseBar o precio publicado vigente
        let target = (currentPrice > 0) ? currentPrice : baseBar;

        // === SITUACIÓN CRÍTICA / OVERBOOKING (>95% o >100%) ===
        if (occupancyPct >= 100 || otbRooms >= capacity) {
            action = 'REVISIÓN MANUAL';
            proposedPrice = Math.max(target * 1.25, highestCompPrice > 0 ? highestCompPrice * 1.05 : target + 25);
            reasons.push(`Hotel al 100% de capacidad (${otbRooms}/${capacity} habs). Proteger inventario y cerrar canales de baja rentabilidad.`);
            riskAssessment = 'Riesgo alto de overbooking / desvíos.';
            confidenceScore = 'Muy Alta';
        }
        else if (occupancyPct >= 85) {
            action = 'SUBIR';
            // Escalado agresivo por alta compresión
            const boost = (occupancyPct >= 90) ? 1.15 : 1.10;
            target = Math.max(target * boost, baseBar * 1.10);
            if (highestCompPrice > target) {
                target = Math.min(target, highestCompPrice * 0.98);
            }
            reasons.push(`Ocupación muy alta (${occupancyPct.toFixed(0)}%). Demanda consolidada, oportunidad de maximizar ADR.`);
            if (p7d > 0) reasons.push(`Pick-up 7d positivo (+${p7d} RN) confirma tracción.`);
        }
        // === PICK-UP ACELERADO (MOMENTUM) ===
        else if (p7d >= 6 || p24h >= 3) {
            action = 'SUBIR';
            const pickupFactor = (p7d >= 10) ? 1.08 : 1.05;
            target = target * pickupFactor;
            reasons.push(`Aceleración notable de ventas (Pick-up +${p7d || p24h} RN). Ritmo de demanda por encima de la media.`);
            if (marketAvg > 0 && target < marketAvg) {
                reasons.push(`Margen de subida respecto a la media de mercado (${marketAvg.toFixed(0)} €).`);
            }
        }
        // === PRESIÓN COMPETITIVA (COMPETIDORES LLENOS) ===
        else if (soldCompsCount >= 2 && occupancyPct >= 50) {
            action = 'SUBIR';
            target = target * 1.06;
            reasons.push(`${soldCompsCount} hoteles competidores llenos o sin ventas abiertas en la plaza.`);
        }
        // === OCUPACIÓN BAJA DE ÚLTIMA HORA (<7 DÍAS) - REGLA DE SEGURIDAD EXCEL ===
        else if (daysOut >= 0 && daysOut <= 7 && occupancyPct < 40) {
            // Regla estricta: NO recomendar bajada general de BAR automática
            action = 'MANTENER';
            target = Math.max(target, minFloorPrice);
            reasons.push(`Baja ocupación (${occupancyPct.toFixed(0)}%) con antelación corta (${daysOut} días). Criterio de seguridad: No bajar BAR general; activar promociones segmentadas o paquetes cerrados.`);
            riskAssessment = 'Evitar devaluación de tarifa pública de última hora.';
            confidenceScore = 'Media';
        }
        // === DEMANDA DÉBIL CON ANTELACIÓN SUFICIENTE (>21 DÍAS) ===
        else if (daysOut > 21 && occupancyPct < 25 && p7d <= 0 && p14d <= 0 && target > baseBar) {
            action = 'REVISAR BAJADA';
            target = Math.max(baseBar, target * 0.95);
            reasons.push(`Demanda débil con antelación amplia (${daysOut} días). Tarifa actual por encima de BAR base (${baseBar} €) sin ritmo de reservas.`);
        }
        // === ZONA DE ESTABILIDAD ===
        else {
            action = 'MANTENER';
            if (marketAvg > 0 && Math.abs(target - marketAvg) <= 4) {
                reasons.push(`Tarifa alineada con el mercado (${marketAvg.toFixed(0)} €) y ritmo de reservas estable.`);
            } else {
                reasons.push(`Evolución de ocupación (${occupancyPct.toFixed(0)}%) y pickup dentro de los parámetros esperados.`);
            }
        }

        // Si es Enero o Febrero y hay escalado, incorporar nota
        if (occTierRefPrice && (monthNum === 1 || monthNum === 2)) {
            reasons.push(`Referencia escalado Excel (${occupancyPct.toFixed(0)}% ocupación): ${occTierRefPrice} €.`);
        }

        // Aplicar tarifa suelo inviolable
        const effectiveFloor = Math.max(minFloorPrice, 50);
        if (target < effectiveFloor) {
            target = effectiveFloor;
            reasons.push(`Aplicado suelo mínimo inviolable configurado (${effectiveFloor} €).`);
        }

        const roundedProposed = Math.round(target);
        const roundedCurrent = Math.round(currentPrice > 0 ? currentPrice : baseBar);
        const diffAmount = roundedProposed - roundedCurrent;
        const diffPct = (roundedCurrent > 0) ? ((diffAmount / roundedCurrent) * 100) : 0;

        // Ajustar acción si tras cálculos coincide con el precio vigente
        if (action === 'SUBIR' && diffAmount <= 0) action = 'MANTENER';
        if (action === 'REVISAR BAJADA' && diffAmount >= 0) action = 'MANTENER';

        return {
            dateISO,
            hotelName,
            action, // 'SUBIR' | 'MANTENER' | 'REVISAR BAJADA' | 'REVISIÓN MANUAL'
            baseBar,
            currentPrice: roundedCurrent,
            proposedPrice: roundedProposed,
            minFloorPrice: effectiveFloor,
            occTierRefPrice,
            diffAmount,
            diffPct,
            daysOut,
            reasons,
            fullReasonText: reasons.join(' '),
            confidenceScore,
            riskAssessment,
            isException,
            eventName
        };
    }

    // =========================================================================
    // 6. AGREGACIONES MENSUALES Y POR DÍA DE LA SEMANA (SIN DUPLICACIONES)
    // =========================================================================

    /**
     * Agrega un conjunto de fechas por día de la semana (Lunes a Domingo) para un mes específico.
     * Garantiza deduplicación de fechas utilizando Set de dateISO.
     */
    function aggregateByDayOfWeek(datesList, selectedMonthNum, hotelName = 'Guadiana') {
        const capacity = (hotelName === 'Cumbria' ? 59 : 108);
        const daysOfWeek = [
            { dow: 1, name: 'Lunes',      short: 'Lun' },
            { dow: 2, name: 'Martes',     short: 'Mar' },
            { dow: 3, name: 'Miércoles',  short: 'Mié' },
            { dow: 4, name: 'Jueves',     short: 'Jue' },
            { dow: 5, name: 'Viernes',    short: 'Vie' },
            { dow: 6, name: 'Sábado',     short: 'Sáb' },
            { dow: 7, name: 'Domingo',    short: 'Dom' }
        ];

        const matrix = getBarMatrix();
        const mRow = matrix[selectedMonthNum] || {};

        // Filtrar y deduplicar fechas del mes seleccionado
        const seenDates = new Set();
        const filteredDates = [];

        (datesList || []).forEach(d => {
            if (!d || !d.dateISO || seenDates.has(d.dateISO)) return;
            const parts = d.dateISO.split('-');
            if (parts.length === 3) {
                const m = parseInt(parts[1], 10);
                if (m === selectedMonthNum) {
                    seenDates.add(d.dateISO);
                    filteredDates.push(d);
                }
            }
        });

        // Agrupar por DOW (1 a 7)
        return daysOfWeek.map(dayObj => {
            const matchingDates = filteredDates.filter(d => {
                const parts = d.dateISO.split('-');
                const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                let dNum = dt.getDay();
                let dowKey = (dNum === 0 ? 7 : dNum);
                return dowKey === dayObj.dow;
            });

            const count = matchingDates.length;
            const baseBar = mRow[dayObj.dow] || 64;

            if (count === 0) {
                return {
                    dow: dayObj.dow,
                    name: dayObj.name,
                    short: dayObj.short,
                    count: 0,
                    dates: [],
                    baseBar: baseBar,
                    avgCurrentPrice: 0,
                    avgOccupancyPct: 0,
                    avgOtbRooms: 0,
                    pickupNet24h: 0,
                    pickupNet7d: 0,
                    pickupNet14d: 0,
                    pickupNet30d: 0,
                    hasPickupHistory: false,
                    avgMarketPrice: 0,
                    recommendedPrice: baseBar,
                    justification: 'Sin fechas cargadas para este día del mes.'
                };
            }

            let sumPrice = 0;
            let sumRooms = 0;
            let sumMarket = 0;
            let countMarket = 0;
            let sumP24h = 0;
            let sumP7d = 0;
            let sumP14d = 0;
            let sumP30d = 0;
            let hasHistoryAny = false;
            let sumProposed = 0;

            const dateDetails = matchingDates.map(d => {
                const my = d.hotels ? d.hotels[hotelName] : null;
                const price = (my && !my.sold && my.price > 0) ? my.price : baseBar;
                const rooms = Math.round(d.otbRooms || (my ? (my.otbRooms ?? my.occupancy) : 0) || 0);
                const occPct = (rooms / capacity) * 100;
                const mkt = Number(d.compAvg) || 0;

                sumPrice += price;
                sumRooms += rooms;
                if (mkt > 0) {
                    sumMarket += mkt;
                    countMarket++;
                }

                // Pickup por fecha
                const pData = calculateDailyPickup(hotelName, d.dateISO, { rooms, occupancyPct: occPct });
                if (pData.h24h.available) { sumP24h += pData.h24h.diffRooms; hasHistoryAny = true; }
                if (pData.d7.available)   { sumP7d += pData.d7.diffRooms;   hasHistoryAny = true; }
                if (pData.d14.available)  { sumP14d += pData.d14.diffRooms; hasHistoryAny = true; }
                if (pData.d30.available)  { sumP30d += pData.d30.diffRooms; hasHistoryAny = true; }

                // Evaluar recomendación individual
                const rec = evaluateDailyRecommendation({
                    hotelName,
                    dateISO: d.dateISO,
                    currentPrice: price,
                    marketAvg: mkt,
                    otbRooms: rooms,
                    occupancyPct: occPct,
                    pickupData: pData
                });

                sumProposed += rec.proposedPrice;

                return {
                    dateISO: d.dateISO,
                    label: d.label || d.dateISO,
                    price: price,
                    rooms: rooms,
                    occPct: occPct,
                    marketPrice: mkt,
                    pickup24h: pData.h24h.available ? pData.h24h.diffRooms : null,
                    pickup7d: pData.d7.available ? pData.d7.diffRooms : null,
                    pickup14d: pData.d14.available ? pData.d14.diffRooms : null,
                    recommendation: rec
                };
            });

            const avgPrice = Math.round(sumPrice / count);
            const avgRooms = Math.round(sumRooms / count);
            const avgOcc = (avgRooms / capacity) * 100;
            const avgMkt = countMarket > 0 ? Math.round(sumMarket / countMarket) : 0;
            const avgRecommended = Math.round(sumProposed / count);

            // Justificación sintética del bloque DOW
            let just = '';
            if (avgOcc >= 80) {
                just = `Ocupación elevada (${avgOcc.toFixed(0)}% media). Mantener tarifas firmes o subir en fechas punta.`;
            } else if (sumP7d >= (count * 2)) {
                just = `Demanda activa con pick-up positivo acumulado (+${sumP7d} RN en 7d).`;
            } else if (avgOcc < 35 && avgPrice > baseBar) {
                just = `Ocupación moderada (${avgOcc.toFixed(0)}%). Tarifa actual próxima a la BAR base.`;
            } else {
                just = `Comportamiento estable. Orientación basada en BAR de referencia (${baseBar} €).`;
            }

            return {
                dow: dayObj.dow,
                name: dayObj.name,
                short: dayObj.short,
                count: count,
                dates: dateDetails,
                baseBar: baseBar,
                avgCurrentPrice: avgPrice,
                avgOccupancyPct: avgOcc,
                avgOtbRooms: avgRooms,
                pickupNet24h: hasHistoryAny ? sumP24h : null,
                pickupNet7d: hasHistoryAny ? sumP7d : null,
                pickupNet14d: hasHistoryAny ? sumP14d : null,
                pickupNet30d: hasHistoryAny ? sumP30d : null,
                hasPickupHistory: hasHistoryAny,
                avgMarketPrice: avgMkt,
                recommendedPrice: avgRecommended,
                justification: just
            };
        });
    }

    /**
     * Resumen agregado del mes completo.
     */
    function aggregateMonthSummary(datesList, selectedMonthNum, hotelName = 'Guadiana') {
        const capacity = (hotelName === 'Cumbria' ? 59 : 108);
        const seen = new Set();
        const monthDates = (datesList || []).filter(d => {
            if (!d || !d.dateISO || seen.has(d.dateISO)) return false;
            const parts = d.dateISO.split('-');
            if (parts.length === 3 && parseInt(parts[1], 10) === selectedMonthNum) {
                seen.add(d.dateISO);
                return true;
            }
            return false;
        });

        const totalDays = monthDates.length;
        if (totalDays === 0) {
            return {
                monthNum: selectedMonthNum,
                monthName: MONTH_NAMES_ES[selectedMonthNum - 1],
                totalDays: 0,
                avgOccPct: 0,
                totalSoldRooms: 0,
                totalAvailableRooms: 0,
                forecastADR: 0,
                avgCurrentPrice: 0,
                avgRecommendedPrice: 0,
                forecastRevenue: 0,
                pickupAccum7d: null,
                pickupAccum14d: null,
                pickupAccum30d: null,
                avgMarketPrice: 0,
                compGapPct: 0
            };
        }

        let sumRooms = 0;
        let sumRevenue = 0;
        let sumPrice = 0;
        let sumMkt = 0;
        let countMkt = 0;
        let sumRec = 0;
        let p7dSum = 0;
        let p14dSum = 0;
        let p30dSum = 0;
        let hasHist = false;

        monthDates.forEach(d => {
            const my = d.hotels ? d.hotels[hotelName] : null;
            const baseInfo = getBaseBarForDate(d.dateISO);
            const price = (my && !my.sold && my.price > 0) ? my.price : baseInfo.bar;
            const rooms = Math.round(d.otbRooms || (my ? (my.otbRooms ?? my.occupancy) : 0) || 0);
            const occPct = (rooms / capacity) * 100;
            const mkt = Number(d.compAvg) || 0;

            sumRooms += rooms;
            sumRevenue += (rooms * price);
            sumPrice += price;
            if (mkt > 0) {
                sumMkt += mkt;
                countMkt++;
            }

            const pData = calculateDailyPickup(hotelName, d.dateISO, { rooms, occupancyPct: occPct });
            if (pData.d7.available)  { p7dSum += pData.d7.diffRooms;   hasHist = true; }
            if (pData.d14.available) { p14dSum += pData.d14.diffRooms; hasHist = true; }
            if (pData.d30.available) { p30dSum += pData.d30.diffRooms; hasHist = true; }

            const rec = evaluateDailyRecommendation({
                hotelName,
                dateISO: d.dateISO,
                currentPrice: price,
                marketAvg: mkt,
                otbRooms: rooms,
                occupancyPct: occPct,
                pickupData: pData
            });
            sumRec += rec.proposedPrice;
        });

        const totalAvail = totalDays * capacity;
        const avgOcc = totalAvail > 0 ? (sumRooms / totalAvail) * 100 : 0;
        const avgCur = Math.round(sumPrice / totalDays);
        const avgMkt = countMkt > 0 ? Math.round(sumMkt / countMkt) : 0;
        const avgRec = Math.round(sumRec / totalDays);
        const forecastADR = sumRooms > 0 ? (sumRevenue / sumRooms) : avgCur;
        const compGap = (avgCur > 0 && avgMkt > 0) ? (((avgCur - avgMkt) / avgMkt) * 100) : 0;

        return {
            monthNum: selectedMonthNum,
            monthName: MONTH_NAMES_ES[selectedMonthNum - 1],
            totalDays: totalDays,
            avgOccPct: avgOcc,
            totalSoldRooms: sumRooms,
            totalAvailableRooms: totalAvail,
            forecastADR: Math.round(forecastADR),
            avgCurrentPrice: avgCur,
            avgRecommendedPrice: avgRec,
            forecastRevenue: Math.round(sumRevenue),
            pickupAccum7d: hasHist ? p7dSum : null,
            pickupAccum14d: hasHist ? p14dSum : null,
            pickupAccum30d: hasHist ? p30dSum : null,
            avgMarketPrice: avgMkt,
            compGapPct: compGap
        };
    }

    // Exportación pública del módulo
    const api = {
        DEFAULT_BAR_MATRIX_2027,
        DEFAULT_OCC_TIERS_JAN_FEB,
        DOW_NAMES_ES,
        MONTH_NAMES_ES,
        getBarMatrix,
        saveBarMatrix,
        resetBarMatrixToDefault,
        getOccTiersJanFeb,
        saveOccTiersJanFeb,
        getPricingExceptions,
        savePricingExceptions,
        setDateException,
        getBaseBarForDate,
        recordDailySnapshot,
        captureBatchSnapshots,
        calculateDailyPickup,
        evaluateDailyRecommendation,
        aggregateByDayOfWeek,
        aggregateMonthSummary
    };

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.PricingIntelligence = api;

})(typeof window === 'object' ? window : globalThis);
