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

function generateHotelDocx(mdPath, docxName) {
  let resolvedMd = mdPath;
  if (!fs.existsSync(resolvedMd) && fs.existsSync('Presupuestos/' + mdPath)) {
    resolvedMd = 'Presupuestos/' + mdPath;
  }
  const md = fs.readFileSync(resolvedMd, 'utf8');
  const lines = md.split('\n');
  const docChildren = [];

  const COLOR_PRIMARY = '1E40AF';
  const COLOR_SECONDARY = '3B82F6';
  const COLOR_DARK = '0F172A';
  const COLOR_TEXT = '334155';
  const COLOR_BG_HEADER = '1E3A8A';
  const COLOR_BG_ROW_ALT = 'F8FAFC';
  const COLOR_BORDER = 'CBD5E1';
  const FONT_FAMILY = 'Calibri';
  const USABLE_WIDTH_TWIPS = 14800;

  function getTableColumnWidths(numCols, headerCells) {
    const headerStr = headerCells.map(c => c.toLowerCase()).join(' ');
    if (numCols === 6 && (headerStr.includes('kpis') || headerStr.includes('métrica'))) {
      return [3700, 2220, 2220, 2220, 2220, 2220];
    }
    if (numCols === 7 && (headerStr.includes('ejercicio') || headerStr.includes('contexto'))) {
      return [1480, 2220, 1776, 1628, 1628, 1628, 4440];
    }
    if (numCols === 10) {
      return [1600, 1000, 1300, 1600, 1800, 1300, 1300, 1300, 1600, 2000];
    }
    if (numCols === 11) {
      return [1332, 888, 1184, 1480, 1628, 1184, 1184, 1184, 1184, 1480, 1480];
    }
    if (numCols === 7 && headerStr.includes('directriz')) {
      return [1480, 1628, 1628, 1480, 1480, 1924, 5180];
    }
    if (numCols === 7 && (headerStr.includes('media') || headerStr.includes('criterio'))) {
      return [1400, 1750, 1750, 1750, 1850, 2100, 4200];
    }
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

          let alignment = AlignmentType.LEFT;
          if (isHeader) {
            alignment = (isFirstCol || isLastCol) ? AlignmentType.LEFT : AlignmentType.RIGHT;
          } else {
            const isNumeric = /[\d€%]/.test(cleanText) && !cleanText.includes('Base') && !cleanText.includes('Ocupación') && !cleanText.includes('Filtro');
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
                    size: isHeader ? 18 : 17,
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

  function parseFormattedText(text, defaultBold = false, defaultSize = 20, defaultColor = COLOR_TEXT) {
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

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
                size: 36,
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
                size: 26,
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
                size: 22,
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
          run: { font: FONT_FAMILY, size: 20, color: COLOR_TEXT },
          paragraph: { spacing: { line: 260, before: 60, after: 60 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            orientation: PageOrientation.LANDSCAPE,
            size: { width: 16838, height: 11906 },
            margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 },
          },
        },
        children: docChildren,
      },
    ],
  });

  Packer.toBuffer(doc).then(buffer => {
    const paths = [docxName, 'Presupuestos/' + docxName, 'C:/Users/comun/Downloads/' + docxName];
    paths.forEach(p => {
      try {
        fs.writeFileSync(p, buffer);
        console.log(`[OK] Saved ${docxName} to ${p}`);
      } catch (err) {
        console.warn(`[LOCKED] Could not write to ${p} (file may be open in Word): ${err.message}`);
      }
    });
  });
}

generateHotelDocx('Informe_Presupuesto_2027_Sercotel_Guadiana.md', 'Informe_Presupuesto_2027_Sercotel_Guadiana.docx');
generateHotelDocx('Informe_Presupuesto_2027_Hotel_Cumbria.md', 'Informe_Presupuesto_2027_Hotel_Cumbria.docx');
