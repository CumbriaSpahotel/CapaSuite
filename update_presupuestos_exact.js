const fs = require('fs');

// ==========================================
// 1. UPDATE GUADIANA MARKDOWN
// ==========================================
let gMd = fs.readFileSync('Presupuestos/Informe_Presupuesto_2027_Sercotel_Guadiana.md', 'utf8');

const gOldTable5Regex = /## 5\. PLAN MAESTRO MENSUAL 2027[\s\S]*?---\s*\n\s*## 6\./;
const gNewTable5 = `## 5. PLAN MAESTRO MENSUAL 2027 (DETALLE POR HABITACIONES, ADR Y REVPAR)

| Mes | Días | Capacidad (RN) | Base 2026 (Ref) (€) | Propuesta 2027 (€) | RN 2027 | ADR 2027 (€) | Ocupación (%) | RevPAR (€) | Variación vs Base |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Enero** | 31 | 3.348 | 63.750 € | **68.531,00 €** | 1.072 | 63,94 € | 32,0% | 20,47 € | +7,5% |
| **Febrero** | 28 | 3.024 | 77.834 € | **83.672,00 €** | 1.344 | 62,26 € | 44,4% | 27,67 € | +7,5% |
| **Marzo** | 31 | 3.348 | 110.147 € | **118.408,00 €** | 1.660 | 71,32 € | 49,6% | 35,37 € | +7,5% |
| **Abril** | 30 | 3.240 | 142.275 € | **152.946,00 €** | 2.298 | 66,56 € | 70,9% | 47,21 € | +7,5% |
| **Mayo** | 31 | 3.348 | 171.804 € | **184.689,00 €** | 2.420 | 76,33 € | 72,3% | 55,16 € | +7,5% |
| **Junio** | 30 | 3.240 | 126.492 € | **135.979,00 €** | 1.891 | 71,93 € | 58,4% | 41,97 € | +7,5% |
| **Julio** | 31 | 3.348 | 113.348 € | **121.849,00 €** | 1.799 | 67,75 € | 53,7% | 36,39 € | +7,5% |
| **Agosto** | 31 | 3.348 | 142.492 € | **153.179,00 €** | 2.209 | 69,35 € | 66,0% | 45,75 € | +7,5% |
| **Septiembre** | 30 | 3.240 | 143.895 € | **154.687,00 €** | 2.328 | 66,46 € | 71,9% | 47,74 € | +7,5% |
| **Octubre** | 31 | 3.348 | 163.664 € | **175.939,00 €** | 2.942 | 59,81 € | 87,9% | 52,55 € | +7,5% |
| **Noviembre** | 30 | 3.240 | 113.087 € | **121.569,00 €** | 1.845 | 65,88 € | 56,9% | 37,52 € | +7,5% |
| **Diciembre** | 31 | 3.348 | 94.827 € | **101.939,00 €** | 1.585 | 64,33 € | 47,3% | 30,45 € | +7,5% |
| **TOTAL** | **365** | **39.420** | **1.463.615 €** | **1.573.386,12 €** | **23.393** | **67,26 €** | **59,34%** | **39,91 €** | **+7,5%** |

*(Nota de Coherencia Oficial: Las cifras mensuales y anuales de este plan coinciden al 100% con la Opción B: Lógica de Mercado configurada y aprobada en CapaSuite).*

---

## 6.`;

gMd = gMd.replace(gOldTable5Regex, gNewTable5);

// Update Section 3 table in Guadiana
const gOldTable3Regex = /\| Mes \| 2022 \(€\)[\s\S]*?\| \*\*TOTAL\*\* \| \*\*1\.010\.330 €\*\*[\s\S]*?\| \*\*1\.573\.386 €\*\* \|[^\n]*/;
const gNewTable3 = `| Mes | 2022 (€) | 2023 (€) | 2024 (€) | 2025 (€) | Media 4 Años (€) | Propuesta 2027 (€) | Justificación de Crecimiento |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Enero** | 53.221 € | 49.845 € | 41.029 € | 46.594 € | 47.672 € | **68.531 €** | Captación activa de grupos deportivos y técnicos a tarifa dinámica. |
| **Febrero** | 92.867 € | 81.304 € | 59.827 € | 65.276 € | 74.819 € | **83.672 €** | Retorno al nivel medio de demanda corporativa invernal. |
| **Marzo** | 58.393 € | 71.543 € | 125.581 € | 85.752 € | 85.317 € | **118.408 €** | Impulso de congresos de primavera y ferias sectoriales. |
| **Abril** | 82.924 € | 107.118 € | 130.668 € | 112.422 € | 108.283 € | **152.946 €** | Alta tracción empresarial y puentes primaverales (70,9% ocup.). |
| **Mayo** | 143.835 € | 127.007 € | 124.149 € | 161.051 € | 139.011 € | **184.689 €** | Mes de mayor facturación absoluta del año (ADR 76,33 €). |
| **Junio** | 85.069 € | 80.273 € | 105.104 € | 107.233 € | 94.420 € | **135.979 €** | Cierre de cursos y eventos corporativos antes del verano. |
| **Julio** | 82.766 € | 86.808 € | 129.310 € | 129.649 € | 107.133 € | **121.849 €** | Turismo en tránsito hacia Andalucía y ocio familiar. |
| **Agosto** | 81.625 € | 89.013 € | 121.359 € | 124.448 € | 104.111 € | **153.179 €** | Gran volumen de paso vacacional y escapadas de interior. |
| **Septiembre**| 89.156 € | 110.396 € | 102.697 € | 143.034 € | 111.321 € | **154.687 €** | Reactivación corporativa otoñal a pleno rendimiento. |
| **Octubre** | **100.195 €**| **107.855 €**| **117.252 €**| **146.243 €**| **117.886 €**| **175.939 €**| **Mes de máxima ocupación de la serie (87,9% y 2.942 RN).** |
| **Noviembre** | 73.495 € | 50.767 € | 103.299 € | 106.319 € | 83.470 € | **121.569 €** | Jornadas profesionales y administración pública. |
| **Diciembre** | 66.784 € | 73.620 € | 74.543 € | 90.839 € | 76.447 € | **101.939 €** | Puente de la Constitución y escapadas navideñas. |
| **TOTAL** | **1.010.330 €**|**1.035.549 €**|**1.234.818 €**|**1.318.860 €**|**1.149.889 €**|**1.573.386 €**| **Crecimiento del +7,5% rigurosamente verificado.**`;

gMd = gMd.replace(gOldTable3Regex, gNewTable3);

// Update Section 4 text for Octubre
gMd = gMd.replace('Octubre 2027 (Propuesta): 2.905 RN (86,8% ocupación / 184.821,89 €)', 'Octubre 2027 (Propuesta Oficial): 2.942 RN (87,9% ocupación / 175.939,00 €)');
gMd = gMd.replace('¿Por qué Octubre tiene margen para alcanzar los 184.822 €?', '¿Por qué Octubre lidera la ocupación con 2.942 RN y 175.939 €?');

// Update Section 7 OTB table in Guadiana
const gOldTable7Regex = /\| Mes \| En Cartera 2027 \(OTB €\)[\s\S]*?\| \*\*TOTAL \(Ene-Oct\)\*\*\|[^\n]*/;
const gNewTable7 = `| Mes | En Cartera 2027 (OTB €) | RN en Libros | ADR Cartera (€) | Objetivo 2027 (€) | % Ya Asegurado | Pickup Pendiente (€) | Valoración Comercial |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Enero** | **44.055,89 €** | 722 | 61,02 € | 68.531,00 € | **64,3%** | 24.475,11 € | **Excelente base:** Dos tercios de enero ya contratados. |
| **Febrero** | **34.784,42 €** | 462 | 75,29 € | 83.672,00 € | **41,6%** | 48.887,58 € | **Tarifa alta:** ADR en cartera muy potente (75,29 €). |
| **Marzo** | **54.914,94 €** | 973 | 56,44 € | 118.408,00 € | **46,4%** | 63.493,06 € | Buena anticipación de primavera. |
| **Abril** | **66.924,15 €** | 1.204 | 55,58 € | 152.946,00 € | **43,8%** | 86.021,85 € | Fuerte demanda de Semana Santa ya en libros. |
| **Mayo** | **115.355,43 €** | 1.380 | **83,59 €** | 184.689,00 € | **62,5%** | **69.333,57 €** | **Solidez extraordinaria:** 115 k€ ya garantizados a 83,59 € ADR. |
| **Junio** | **70.279,39 €** | 1.069 | 65,74 € | 135.979,00 € | **51,7%** | 65.699,61 € | Más de la mitad del mes contratado. |
| **Julio** | **30.368,83 €** | 600 | 50,61 € | 121.849,00 € | 24,9% | 91.480,17 € | Ritmo habitual de verano (reserva más tardía). |
| **Agosto** | **32.773,61 €** | 653 | 50,19 € | 153.179,00 € | 21,4% | 120.405,39 € | Curva normal de reservas estivales. |
| **Septiembre** | **41.966,76 €** | 806 | 52,07 € | 154.687,00 € | 27,1% | 112.720,24 € | Arranque de cartera corporativa de otoño. |
| **Octubre** | **16.954,59 €** | 310 | 54,69 € | 175.939,00 € | 9,6% | 158.984,41 € | Mayor recorrido de yield (máxima ventana de venta directa). |
| **TOTAL (Ene-Oct)**| **508.378,01 €**| **8.179** | **62,16 €** | **1.449.879,00 €** | **35,1%** | **941.500,99 €** | **Medio millón de euros ya asegurado físicamente.**`;

gMd = gMd.replace(gOldTable7Regex, gNewTable7);

// Update Trimestres text in Guadiana
gMd = gMd.replace(/Q1.*?\n/g, 'Q1 (Ene-Mar): **270.610,82 €** (17,2% del año · ADR: 66,4 €)\n');

fs.writeFileSync('Presupuestos/Informe_Presupuesto_2027_Sercotel_Guadiana.md', gMd, 'utf8');
console.log('[OK] Updated Presupuestos/Informe_Presupuesto_2027_Sercotel_Guadiana.md');

// ==========================================
// 2. UPDATE CUMBRIA MARKDOWN
// ==========================================
let cMd = fs.readFileSync('Presupuestos/Informe_Presupuesto_2027_Hotel_Cumbria.md', 'utf8');

// Update Resumen Ejecutivo KPIs for Cumbria
const cOldKpiRegex = /\| Métrica \| Presupuesto 2026 Oficial[\s\S]*?\| \*\*RevPAR Estimado \(€\)\*\* \|[^\n]*/;
const cNewKpi = `| Métrica | Base 2026 (Referencia) | Propuesta 2027 (Oficial) | Variación vs Base |
| :--- | :---: | :---: | :---: |
| **Room Revenue (€)** | 922.926 € | **992.145,45 €** | **+7,50%** (+69.219 €) |
| **Habitaciones Noche (RN)** | 14.931 | **15.434** | **+3,37%** (+503 RN) |
| **Tarifa Media Diaria (ADR)** | 61,81 € | **64,28 €** | **+4,00%** (+2,47 €) |
| **Ocupación Media (%)** | 69,33% | **71,67%** | **+2,34 p.p.** |
| **RevPAR Estimado (€)** | 42,86 € | **46,07 €** | **+7,50%** |`;

cMd = cMd.replace(cOldKpiRegex, cNewKpi);

// Replace general numbers in Cumbria
cMd = cMd.replace(/816\.591,50\s*€/g, '992.145,45 €');
cMd = cMd.replace(/13\.003\s*RN/g, '15.434 RN');
cMd = cMd.replace(/13\.003/g, '15.434');
cMd = cMd.replace(/62,80\s*€/g, '64,28 €');
cMd = cMd.replace(/60,38\s*%/g, '71,67%');
cMd = cMd.replace(/37,92\s*€/g, '46,07 €');

// Replace table 5 in Cumbria
const cOldTable5Regex = /## 5\. PLAN MAESTRO MENSUAL 2027[\s\S]*?---\s*\n\s*## 6\./;
const cNewTable5 = `## 5. PLAN MAESTRO MENSUAL 2027 (HABITACIONES, ADR, OCUPACIÓN Y REVPAR)

El plan operativo mensual traduce el objetivo del **+7,50%** respecto a la Base 2026 en variables de gestión diaria sincronizadas al 100% con CapaSuite:

| Mes | Días | Capacidad (RN) | Base 2026 (Ref) (€) | Propuesta 2027 (€) | RN 2027 | ADR 2027 (€) | Ocupación (%) | RevPAR (€) | Variación vs Base |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Enero** | 31 | 1.829 | 47.394 € | **50.949,00 €** | 938 | 54,34 € | 51,3% | 27,86 € | +7,5% |
| **Febrero** | 28 | 1.652 | 48.078 € | **51.684,00 €** | 943 | 54,83 € | 57,1% | 31,29 € | +7,5% |
| **Marzo** | 31 | 1.829 | 69.417 € | **74.623,00 €** | 1.171 | 63,72 € | 64,0% | 40,80 € | +7,5% |
| **Abril** | 30 | 1.770 | 84.283 € | **90.604,00 €** | 1.332 | 68,01 € | 75,3% | 51,19 € | +7,5% |
| **Mayo** | 31 | 1.829 | 100.064 € | **107.569,00 €** | 1.523 | 70,65 € | 83,3% | 58,81 € | +7,5% |
| **Junio** | 30 | 1.770 | 77.802 € | **83.637,00 €** | 1.351 | 61,91 € | 76,3% | 47,25 € | +7,5% |
| **Julio** | 31 | 1.829 | 76.405 € | **82.135,00 €** | 1.387 | 59,21 € | 75,8% | 44,91 € | +7,5% |
| **Agosto** | 31 | 1.829 | 75.141 € | **80.777,00 €** | 1.432 | 56,42 € | 78,3% | 44,16 € | +7,5% |
| **Septiembre** | 30 | 1.770 | 77.986 € | **83.835,00 €** | 1.354 | 61,91 € | 76,5% | 47,36 € | +7,5% |
| **Octubre** | 31 | 1.829 | 100.585 € | **108.129,00 €** | 1.618 | 66,84 € | 88,5% | 59,12 € | +7,5% |
| **Noviembre** | 30 | 1.770 | 88.135 € | **94.745,00 €** | 1.266 | 74,83 € | 71,5% | 53,53 € | +7,5% |
| **Diciembre** | 31 | 1.829 | 77.636 € | **83.459,00 €** | 1.119 | 74,56 € | 61,2% | 45,63 € | +7,5% |
| **TOTAL** | **365** | **21.535** | **922.926 €** | **992.145,45 €** | **15.434** | **64,28 €** | **71,67%** | **46,07 €** | **+7,5%** |

*(Nota de Coherencia Oficial: Las cifras mensuales y anuales coinciden con la Opción B (Lógica de Mercado) de la Calculadora de Presupuestos de CapaSuite, aprobada para Dirección).*

---

## 6.`;

cMd = cMd.replace(cOldTable5Regex, cNewTable5);

// Update Trimestres breakdown in Cumbria
const cNewTrimestres = `### Resumen de Producción por Trimestres (Cumbria 2027)
* **Q1 (Enero – Marzo):** **177.255,68 €** (17,9% del total · 3.052 RN · ADR: 58,08 €)
* **Q2 (Abril – Junio):** **281.810,17 €** (28,4% del total · 4.206 RN · ADR: 67,00 €)
* **Q3 (Julio – Septiembre):** **246.746,90 €** (24,9% del total · 4.173 RN · ADR: 59,13 €)
* **Q4 (Octubre – Diciembre):** **286.332,70 €** (28,9% del total · 4.003 RN · ADR: 71,53 €)`;

if (cMd.includes('### Resumen de Producción por Trimestres')) {
  cMd = cMd.replace(/### Resumen de Producción por Trimestres[\s\S]*?(?=---)/, cNewTrimestres + '\n\n');
}

fs.writeFileSync('Presupuestos/Informe_Presupuesto_2027_Hotel_Cumbria.md', cMd, 'utf8');
console.log('[OK] Updated Presupuestos/Informe_Presupuesto_2027_Hotel_Cumbria.md');

// Also update artifacts directory
const artDir = 'C:/Users/comun/.gemini/antigravity/brain/c333d967-3479-41a2-adf4-5e8d39f4197f';
try {
  fs.writeFileSync(artDir + '/Informe_Presupuesto_2027_Sercotel_Guadiana.md', gMd, 'utf8');
  fs.writeFileSync(artDir + '/Informe_Presupuesto_2027_Hotel_Cumbria.md', cMd, 'utf8');
  console.log('[OK] Updated Artifact MD files');
} catch(e) {
  console.warn('Could not update artifact dir:', e.message);
}
