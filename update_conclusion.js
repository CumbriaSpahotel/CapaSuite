const fs = require('fs');

let content = fs.readFileSync('Informe_Presupuesto_2027_Sercotel_Guadiana.md', 'utf8');

// 1. Highlight target +7.5% in Section 1 title and text
content = content.replace(
  '# PROPUESTA Y JUSTIFICACIÓN DEL PRESUPUESTO OFICIAL 2027',
  '# PROPUESTA Y JUSTIFICACIÓN DEL PRESUPUESTO OFICIAL 2027: OBJETIVO +7,5%'
);

content = content.replace(
  'El objetivo propuesto se establece en **1.573.386,12 €**, fundamentado en la consolidación del crecimiento orgánico de los últimos cuatro ejercicios y en una gestión tarifaria selectiva por estacionalidad.',
  'El objetivo central se establece en un **crecimiento de ingresos del +7,50%** respecto a la base de cierre del ejercicio actual, fijando la meta presupuestaria de Alojamiento en **1.573.386,12 €** (+109.771 € de incremento neto). Esta meta consolida la senda de crecimiento demostrada por el hotel y aplica una gestión tarifaria selectiva por estacionalidad.'
);

// 2. Expand Section 8 (Conclusion) with strong inflation, GOP margin and feasibility arguments
const newConclusion = `## 8. CONCLUSIÓN Y DICTAMEN FINAL: VIABILIDAD DEL OBJETIVO +7,5%

La propuesta de alcanzar **1.573.386,12 € (+7,50% de crecimiento)** en 2027 no es una hipótesis voluntarista, sino un objetivo técnico medido y de máxima solidez para el Sercotel Guadiana:

1. **Defensa Directa Frente a la Inflación y Protección del Margen Operativo (GOP):**
   * El objetivo combina una subida de tarifa media del **+4,00% (ADR de 67,30 €)** y un incremento moderado de pernoctaciones del **+3,43% (+775 RN al año)**.
   * Este aumento del ADR (+2,59 € netos por habitación ocupada) **absorbe con creces la inflación estructural esperada de costes (convenios colectivos, energía, suministros y lavandería)**, proyectada en el entorno del 2,5%–3,0%.
   * Cada euro adicional captado vía tarifa media impacta directamente en el beneficio neto (*bottom-line*), asegurando la **expansión del margen bruto de explotación (GOP)** sin incrementar proporcionalmente los costes variables de servicio.

2. **Respaldo Incontestable de la Serie Histórica de 10 Años (2016 – 2025):**
   * El hotel ha demostrado una progresión sólida de tarifa (+48,9% desde 2016) y cuenta con capacidad contrastada para absorber más de 22.800 habitaciones al año (como ya ocurrió en 2017 y 2018).
   * La meta de **23.393 habitaciones** representa un nivel de ocupación equilibrado (**59,34%**), perfectamente asumible para la operativa interna sin generar saturación de plantilla ni caídas en la satisfacción del huésped.

3. **Garantía de Cartera Real: Más de Medio Millón de Euros Ya Asegurado:**
   * La existencia de **508.378,01 € en cartera cerrada (*On-The-Books*)** para 2027 con más de un año de antelación otorga un grado de certidumbre excepcional: **el 38,1% del periodo de enero a octubre ya está físicamente vendido**.
   * Meses estratégicos como Mayo (81,6% de cobertura con un ADR de 83,59 €) reducen al mínimo el riesgo de desviación, permitiendo concentrar los esfuerzos de *yield management* en maximizar el precio de las habitaciones restantes.

En conclusión, el objetivo de **1.573.386,12 € (+7,5%)** maximiza el valor patrimonial y operativo del hotel, blinda su cuenta de resultados frente al escenario macroeconómico y sitúa el RevPAR en **39,91 €**, el rendimiento por habitación más alto en la historia del establecimiento.
`;

content = content.replace(/## 8\. CONCLUSIÓN Y DICTAMEN FINAL[\s\S]*$/, newConclusion);

fs.writeFileSync('Informe_Presupuesto_2027_Sercotel_Guadiana.md', content, 'utf8');
console.log('Markdown successfully updated with explicit +7.5% and enhanced conclusion!');
