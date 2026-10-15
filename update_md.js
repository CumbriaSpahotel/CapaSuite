const fs = require('fs');

let content = fs.readFileSync('Informe_Presupuesto_2027_Sercotel_Guadiana.md', 'utf8');

const oldTableRegex = /### Serie Histórica Consolidada 2016 – 2025 \(Solo Alojamiento\)[\s\S]*?## 3\. COMPORTAMIENTO/;

const newSection = `### Serie Histórica Consolidada 2016 – 2025 (Exclusivo Alojamiento)

| Ejercicio | Room Revenue (€) | Habitaciones (RN) | ADR (€) | Ocupación (%) | RevPAR (€) | Contexto de Mercado (Alojamiento) |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2016** | 899.135 € | 21.346 | 42,12 € | 54,1% | 22,81 € | Etapa base tarifaria baja. |
| **2017** | 1.032.432 € | 22.607 | 45,67 € | 57,3% | 26,19 € | Primer umbral del millón de euros en habitaciones. |
| **2018** | 1.058.646 € | 22.822 | 46,39 € | 57,9% | 26,86 € | Estabilidad de volumen pre-pandemia. |
| **2019** | 1.047.019 € | 20.200 | 51,83 € | 51,2% | 26,56 € | Salto inicial de ADR (>50 €). |
| **2020** | 517.991 € | 10.161 | 50,98 € | 25,8% | 13,14 € | Ejercicio COVID-19. |
| **2021** | 915.712 € | 18.345 | 49,92 € | 46,5% | 23,23 € | Recuperación gradual de pernoctaciones. |
| **2022** | 1.010.330 € | 18.236 | 55,40 € | 46,3% | 25,63 € | Consolidación de tarifa post-pandemia. |
| **2023** | 1.035.549 € | 17.627 | 58,75 € | 44,7% | 26,27 € | Reposicionamiento hacia cliente corporativo directo. |
| **2024** | 1.234.818 € | 20.765 | 59,47 € | 52,7% | 31,32 € | Fuerte expansión de demanda (+19,2% en Room Rev). |
| **2025** | 1.318.860 € | 21.031 | 62,71 € | 53,4% | 33,46 € | Récord histórico consolidado de habitaciones. |
| **2026 (Est.)**| 1.463.615 € | 22.618 | 64,71 € | 57,4% | 37,13 € | Cierre proyectado en curso. |
| **2027 (Prop.)**| **1.573.386 €**| **23.393** | **67,30 €** | **59,3%** | **39,91 €** | **Objetivo Presupuestario de Habitaciones.** |

### Conclusiones Clave de la Serie Histórica de Alojamiento:
1. **El ADR de alojamiento se ha incrementado un +48,9% desde 2016** (pasando de 42,12 € a 62,71 € en 2025 y 64,71 € en 2026). El objetivo de **67,30 €** para 2027 representa una subida moderada de **+2,59 € (+4,0%)**, perfectamente alineada con la progresión del hotel.
2. **El hotel ya demostró capacidad física de absorber más de 22.800 habitaciones al año** (22.822 RN en 2018 y 22.607 RN en 2017). Comercializar **23.393 RN** en 2027 supone recuperar ese volumen histórico de pernoctaciones pero capturando **+21 € más de tarifa por habitación** que en 2018.
3. **El RevPAR crece de forma constante hasta los 39,91 €**, garantizando la máxima rentabilidad por habitación disponible de la historia del establecimiento.

---

## 3. COMPORTAMIENTO`;

content = content.replace(oldTableRegex, newSection);
fs.writeFileSync('Informe_Presupuesto_2027_Sercotel_Guadiana.md', content, 'utf8');
console.log('Successfully updated Informe_Presupuesto_2027_Sercotel_Guadiana.md');
