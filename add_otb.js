const fs = require('fs');

let content = fs.readFileSync('Informe_Presupuesto_2027_Sercotel_Guadiana.md', 'utf8');

const otbSection = `
---

## 7. ANÁLISIS DE CARTERA REAL (OTB 2027 EN LIBROS): GRADO DE COBERTURA

A fecha actual, el sistema registra ya una **cartera contratada (*On-The-Books / OTB*) de 508.378,01 € y 8.179 habitaciones noche** para el ejercicio 2027 (de enero a octubre). 

Esto demuestra que **un 32,3% del presupuesto anual total (y un 38,1% del periodo analizado) ya está físicamente asegurado con más de un año de antelación**, lo que reduce drásticamente el riesgo de cumplimiento y aporta una solidez excepcional a la propuesta:

### Cobertura de Cartera 2027 vs. Objetivo Presupuestario

| Mes | En Cartera 2027 (OTB €) | RN en Libros | ADR Cartera (€) | Objetivo 2027 (€) | % Ya Asegurado | Pickup Pendiente (€) | Valoración Comercial |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Enero** | **44.055,89 €** | 722 | 61,02 € | 75.309,58 € | **58,5%** | 31.253,69 € | **Excelente base:** Enero tiene más de la mitad cubierto. |
| **Febrero** | **34.784,42 €** | 462 | 75,29 € | 80.555,06 € | **43,2%** | 45.770,64 € | **Tarifa alta:** ADR en cartera muy potente (75,29 €). |
| **Marzo** | **54.914,94 €** | 973 | 56,44 € | 120.509,54 € | **45,6%** | 65.594,60 € | Buena anticipación de primavera. |
| **Abril** | **66.924,15 €** | 1.204 | 55,58 € | 146.867,73 € | **45,6%** | 79.943,58 € | Fuerte demanda de Semana Santa / puentes ya en libros. |
| **Mayo** | **115.355,43 €** | 1.380 | **83,59 €** | 141.294,13 € | **81,6%** | **25.938,70 €** | **Prácticamente cerrado:** Mayo tiene el 82% garantizado a 83,59 € ADR. |
| **Junio** | **70.279,39 €** | 1.069 | 65,74 € | 133.788,99 € | **52,5%** | 63.509,60 € | Más de la mitad del mes contratado. |
| **Julio** | **30.368,83 €** | 600 | 50,61 € | 137.521,26 € | 22,1% | 107.152,43 € | Ritmo habitual de verano (reserva más tardía). |
| **Agosto** | **32.773,61 €** | 653 | 50,19 € | 147.756,26 € | 22,2% | 114.982,65 € | Curva normal de reservas estivales. |
| **Septiembre** | **41.966,76 €** | 806 | 52,07 € | 167.549,70 € | 25,0% | 125.582,94 € | Arranque de cartera corporativa de otoño. |
| **Octubre** | **16.954,59 €** | 310 | 54,69 € | 184.821,89 € | 9,2% | 167.867,30 € | Mayor recorrido de yield (máxima ventana de venta directa). |
| **TOTAL (Ene-Oct)**| **508.378,01 €**| **8.179** | **62,16 €** | **1.336.004,15 €** | **38,1%** | **827.626,14 €** | **Medio millón de euros ya asegurado.** |

### Tres Argumentos Clave para la Dirección:
1. **Riesgo Operativo Mínimo:** No estamos presupuestando sobre un papel en blanco; **más de medio millón de euros (508 k€)** ya está firmado y en los libros del hotel.
2. **Mayo está prácticamente hecho al 82%:** Con **115.355 €** ya contratados a una tarifa media récord de **83,59 €**, solo faltan ~25 k€ para completar el mes.
3. **El primer semestre (Ene - Jun) tiene un 54,6% de cobertura:** Contar con 386 k€ ya asegurados en la primera mitad del año da total tranquilidad de tesorería y valida la viabilidad del crecimiento.
`;

content = content.replace('## 7. CONCLUSIÓN Y DICTAMEN FINAL', otbSection + '\n## 8. CONCLUSIÓN Y DICTAMEN FINAL');
fs.writeFileSync('Informe_Presupuesto_2027_Sercotel_Guadiana.md', content, 'utf8');
console.log('OTB section added successfully!');
