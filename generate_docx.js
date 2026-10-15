const fs = require('fs');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
  PageOrientation
} = require('docx');

const md = fs.readFileSync('Informe_Presupuesto_2027_Sercotel_Guadiana.md', 'utf8');
const lines = md.split('\n');

const docChildren = [];

// Color Palette
const COLOR_PRIMARY = '1E40AF';    // Corporate Navy Blue
const COLOR_SECONDARY = '3B82F6';  // Light Accent Blue
const COLOR_DARK = '0F172A';       // Dark Slate Title
const COLOR_TEXT = '334155';       // Slate Body Text
const COLOR_BG_HEADER = '1E3A8A';  // Header background table
const COLOR_BG_ROW_ALT = 'F8FAFC'; // Light alternating row
const COLOR_BORDER = 'CBD5E1';     // Table border gray
const FONT_FAMILY = 'Calibri';

// Page dimensions for Landscape:
// A4 Landscape width = 16838 twips (29.7cm), height = 11906 twips (21.0cm)
// Margins: Left=1000, Right=1000 twips (~1.75cm). Usable width = ~14838 twips.
const USABLE_WIDTH_TWIPS = 14800;

function getTableColumnWidths(numCols, headerCells) {
  const headerStr = headerCells.map(c => c.toLowerCase()).join(' ');
  
  // Table 1: Ficha KPIs (6 cols)
  if (numCols === 6 && headerStr.includes('kpis') || headerStr.includes('métrica')) {
    // Total 100%: 25%, 15%, 15%, 15%, 15%, 15%
    return [3700, 2220, 2220, 2220, 2220, 2220];
  }

  // Table 2: Serie Histórica 10 años (7 cols: Ejercicio, Room Rev, RN, ADR, Occ, RevPAR, Contexto)
  if (numCols === 7 && (headerStr.includes('ejercicio') || headerStr.includes('contexto'))) {
    // Ejercicio (10%), Room Rev (15%), RN (12%), ADR (11%), Occ (11%), RevPAR (11%), Contexto (30%)
    return [1480, 2220, 1776, 1628, 1628, 1628, 4440];
  }

  // Table 3: Comparativa Cuatrianual 2022-2025 (8 cols: Mes, 22, 23, 24, 25, Media, Prop, Justif)
  if (numCols === 8 && headerStr.includes('media 4 años')) {
    // Mes (9%), 2022(10%), 2023(10%), 2024(10%), 2025(10%), Media(10%), Prop 2027(11%), Justif(30%)
    return [1332, 1480, 1480, 1480, 1480, 1480, 1628, 4440];
  }

  // Table 4: Plan Mensual Maestro (11 cols: Mes, Días, Cap, BGT26, Prop27, RN, ADR, Occ, RevPAR, Var)
  if (numCols === 11) {
    // Mes(9%), Días(6%), Cap(8%), BGT26(10%), Prop27(11%), RN(8%), ADR(8%), Occ(8%), RevPAR(8%), Var(10%)
    return [1332, 888, 1184, 1480, 1628, 1184, 1184, 1184, 1184, 1480, 1480];
  }

  // Table 5: Desglose Grupos (7 cols: Mes, Total RN, RN Grupos, Cuota %, ADR, Facturación, Directriz)
  if (numCols === 7 && headerStr.includes('directriz')) {
    // Mes(10%), Total RN(11%), RN Grupos(11%), Cuota(10%), ADR(10%), Facturación(13%), Directriz(35%)
    return [1480, 1628, 1628, 1480, 1480, 1924, 5180];
  }

  // Table 6: Cartera OTB 2027 (8 cols: Mes, En Cartera, RN Libros, ADR, Obj 27, % Asegurado, Falta, Diagnóstico)
  if (numCols === 8 && (headerStr.includes('cartera') || headerStr.includes('asegurado'))) {
    // Mes(9%), Cartera(11%), RN Libros(9%), ADR(9%), Obj 27(11%), %Aseg(9%), Falta(11%), Diagnostico(31%)
    return [1332, 1628, 1332, 1332, 1628, 1332, 1628, 4588];
  }

  // Default even distribution
  const equalW = Math.floor(USABLE_WIDTH_TWIPS / numCols);
  return new Array(numCols).fill(equalW);
}

function buildDocxTable(rows) {
  if (!rows || rows.length === 0) return null;
  const numCols = rows[0].length;
  const colWidths = getTableColumnWidths(numCols, rows[0]);
  
  const docxRows = rows.map((rowCells, rIdx) => {
    const isHeader = (rIdx === 0);
    const isAlt = (!isHeader && rIdx % 2 === 1);
    
    return new TableRow({
      tableHeader: isHeader,
      cantSplit: true,
      children: rowCells.map((cellText, cIdx) => {
        const isFirstCol = (cIdx === 0);
        const isLastCol = (cIdx === rowCells.length - 1);
        const cleanText = cellText.replace(/\*\*(.*?)\*\*/g, '$1').trim();
        const isBold = isHeader || cellText.includes('**');
        const width = colWidths[cIdx] || 1500;
        
        // Proper executive alignment:
        // First column: Left (or Center for short codes/years)
        // Last column with descriptive text: Left
        // Middle columns with currency, numbers, %: Right
        let alignment = AlignmentType.LEFT;
        if (isHeader) {
          alignment = (isFirstCol || isLastCol) ? AlignmentType.LEFT : AlignmentType.RIGHT;
        } else {
          const isNumeric = /[\d€%]/.test(cleanText) && !cleanText.includes('Etapa') && !cleanText.includes('Primer') && !cleanText.includes('Estabilidad');
          if (isNumeric && !isFirstCol && !isLastCol) {
            alignment = AlignmentType.RIGHT;
          } else {
            alignment = AlignmentType.LEFT;
          }
        }
        
        return new TableCell({
          width: { size: width, type: WidthType.DXA },
          shading: {
            type: ShadingType.CLEAR,
            fill: isHeader ? COLOR_BG_HEADER : (isAlt ? COLOR_BG_ROW_ALT : 'FFFFFF'),
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: isHeader ? COLOR_PRIMARY : COLOR_BORDER },
            bottom: { style: BorderStyle.SINGLE, size: isHeader ? 8 : 4, color: isHeader ? COLOR_PRIMARY : COLOR_BORDER },
            left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
            right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
          },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
          children: [
            new Paragraph({
              alignment: alignment,
              spacing: { before: 0, after: 0, line: 240 },
              children: [
                new TextRun({
                  text: cleanText,
                  bold: isBold,
                  size: isHeader ? 18 : 17, // 9pt / 8.5pt
                  font: FONT_FAMILY,
                  color: isHeader ? 'FFFFFF' : (isBold ? COLOR_DARK : COLOR_TEXT),
                }),
              ],
            }),
          ],
        });
      }),
    });
  });

  return new Table({
    width: { size: USABLE_WIDTH_TWIPS, type: WidthType.DXA },
    rows: docxRows,
  });
}

function parseFormattedText(text, defaultBold = false, defaultSize = 22, defaultColor = COLOR_TEXT) {
  const parts = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(new TextRun({
        text: text.slice(lastIdx, match.index),
        bold: defaultBold,
        size: defaultSize,
        font: FONT_FAMILY,
        color: defaultColor,
      }));
    }
    const chunk = match[0];
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      parts.push(new TextRun({
        text: chunk.slice(2, -2),
        bold: true,
        size: defaultSize,
        font: FONT_FAMILY,
        color: COLOR_DARK,
      }));
    } else if (chunk.startsWith('*') && chunk.endsWith('*')) {
      parts.push(new TextRun({
        text: chunk.slice(1, -1),
        italics: true,
        bold: defaultBold,
        size: defaultSize,
        font: FONT_FAMILY,
        color: defaultColor,
      }));
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(new TextRun({
      text: text.slice(lastIdx),
      bold: defaultBold,
      size: defaultSize,
      font: FONT_FAMILY,
      color: defaultColor,
    }));
  }

  return parts.length > 0 ? parts : [new TextRun({ text, bold: defaultBold, size: defaultSize, font: FONT_FAMILY, color: defaultColor })];
}

let inTable = false;
let tableRows = [];
let tableCount = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Table detection
  if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
    if (trimmed.includes('---')) continue;
    const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
    tableRows.push(cells);
    inTable = true;
    continue;
  } else {
    if (inTable) {
      const docxTable = buildDocxTable(tableRows);
      if (docxTable) {
        tableCount++;
        docChildren.push(docxTable);
        docChildren.push(new Paragraph({ spacing: { before: 100, after: 120 } }));
      }
      inTable = false;
      tableRows = [];
    }

    if (trimmed.startsWith('# ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.TITLE,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: trimmed.slice(2),
              bold: true,
              size: 36, // 18pt
              color: COLOR_PRIMARY,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('## ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 280, after: 100 },
          children: [
            new TextRun({
              text: trimmed.slice(3),
              bold: true,
              size: 26, // 13pt
              color: COLOR_PRIMARY,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('### ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: trimmed.slice(4),
              bold: true,
              size: 22, // 11pt
              color: COLOR_DARK,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 50, after: 50 },
          children: parseFormattedText(trimmed.slice(2), false, 20),
        })
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.)\s+(.*)/);
      docChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: match[1] + ' ',
              bold: true,
              size: 20,
              color: COLOR_PRIMARY,
              font: FONT_FAMILY,
            }),
            ...parseFormattedText(match[2], false, 20),
          ],
        })
      );
    } else if (trimmed === '---') {
      docChildren.push(
        new Paragraph({
          spacing: { before: 140, after: 140 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER } },
        })
      );
    } else if (trimmed.length > 0) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: parseFormattedText(trimmed, false, 20),
        })
      );
    }
  }
}

if (inTable && tableRows.length > 0) {
  const docxTable = buildDocxTable(tableRows);
  if (docxTable) docChildren.push(docxTable);
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: FONT_FAMILY,
          size: 20, // 10pt
          color: COLOR_TEXT,
        },
        paragraph: {
          spacing: { line: 260, before: 60, after: 60 },
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          orientation: PageOrientation.LANDSCAPE,
          size: {
            width: 16838, // 29.7cm
            height: 11906, // 21.0cm
          },
          margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 }, // ~1.75cm
        },
      },
      children: docChildren,
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  const targetPath = 'Informe_Presupuesto_2027_Sercotel_Guadiana.docx';
  const downloadPath = 'C:/Users/comun/Downloads/Informe_Presupuesto_2027_Sercotel_Guadiana.docx';
  fs.writeFileSync(targetPath, buffer);
  fs.writeFileSync(downloadPath, buffer);
  console.log('DOCX Landscape with exact column widths generated successfully!');
});
