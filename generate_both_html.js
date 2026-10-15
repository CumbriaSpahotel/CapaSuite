const fs = require('fs');

function convertMdToHtml(mdPath, htmlPath, title, downloadDocxName) {
  const md = fs.readFileSync(mdPath, 'utf8');
  let lines = md.split('\n');
  let htmlBody = '';
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) continue;
      let cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      tableRows.push(cells);
      inTable = true;
      continue;
    } else {
      if (inTable) {
        htmlBody += '<table class="report-table">\n<thead>\n<tr>';
        let headerCells = tableRows[0];
        for (let c of headerCells) {
          let text = c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          htmlBody += '<th>' + text + '</th>';
        }
        htmlBody += '</tr>\n</thead>\n<tbody>\n';
        for (let r = 1; r < tableRows.length; r++) {
          htmlBody += '<tr>';
          const numCols = tableRows[r].length;
          for (let cIdx = 0; cIdx < numCols; cIdx++) {
            let c = tableRows[r][cIdx];
            let text = c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            let align = 'right';
            if (cIdx === 0) {
              align = 'left';
            } else if (numCols === 7 && cIdx === 6) {
              align = 'left';
            }
            htmlBody += `<td style="text-align: ${align};">${text}</td>`;
          }
          htmlBody += '</tr>\n';
        }
        htmlBody += '</tbody>\n</table>\n';
        inTable = false;
        tableRows = [];
      }

      if (trimmed.startsWith('# ')) {
        htmlBody += '<h1 class="doc-title">' + trimmed.slice(2) + '</h1>\n';
      } else if (trimmed.startsWith('## ')) {
        htmlBody += '<h2 class="section-title">' + trimmed.slice(3) + '</h2>\n';
      } else if (trimmed.startsWith('### ')) {
        htmlBody += '<h3 class="subsection-title">' + trimmed.slice(4) + '</h3>\n';
      } else if (trimmed.startsWith('```')) {
        if (trimmed === '```') {
          htmlBody += '</pre>\n';
        } else {
          htmlBody += '<pre class="box-code">\n';
        }
      } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        let content = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlBody += '<li>' + content + '</li>\n';
      } else if (/^\d+\.\s/.test(trimmed)) {
        let content = trimmed.slice(3).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlBody += '<li class="numbered">' + content + '</li>\n';
      } else if (trimmed === '---') {
        htmlBody += '<hr class="divider" />\n';
      } else if (trimmed.length > 0) {
        let content = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlBody += '<p>' + content + '</p>\n';
      }
    }
  }

  if (inTable && tableRows.length > 0) {
    htmlBody += '<table class="report-table">\n<thead>\n<tr>';
    let headerCells = tableRows[0];
    for (let c of headerCells) {
      let text = c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlBody += '<th>' + text + '</th>';
    }
    htmlBody += '</tr>\n</thead>\n<tbody>\n';
    for (let r = 1; r < tableRows.length; r++) {
      htmlBody += '<tr>';
      const numCols = tableRows[r].length;
      for (let cIdx = 0; cIdx < numCols; cIdx++) {
        let c = tableRows[r][cIdx];
        let text = c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        let align = 'right';
        if (cIdx === 0) {
          align = 'left';
        } else if (numCols === 7 && cIdx === 6) {
          align = 'left';
        }
        htmlBody += `<td style="text-align: ${align};">${text}</td>`;
      }
      htmlBody += '</tr>\n';
    }
    htmlBody += '</tbody>\n</table>\n';
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
@page { size: A4 landscape; margin: 12mm 15mm 15mm 15mm; }
body { font-family: "Segoe UI", -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 24px; font-size: 10pt; line-height: 1.5; }
.actions-bar { position: sticky; top: 12px; max-width: 1100px; margin: 0 auto 16px auto; display: flex; gap: 12px; justify-content: flex-end; z-index: 100; }
.btn { background: #2563eb; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 6px rgba(37,99,235,0.3); text-decoration: none; }
.btn:hover { background: #1d4ed8; }
.page-container { background: #fff; max-width: 1100px; margin: 0 auto; padding: 40px 48px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
.doc-title { color: #0f172a; font-size: 1.6rem; font-weight: 800; border-bottom: 3px solid #2563eb; padding-bottom: 8px; margin-top: 0; }
.section-title { color: #1e40af; font-size: 1.15rem; font-weight: 700; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 5px; margin-top: 24px; margin-bottom: 12px; }
.subsection-title { color: #334155; font-size: 1rem; font-weight: 700; margin-top: 16px; margin-bottom: 8px; }
.report-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 8.5pt; }
.report-table th, .report-table td { border: 1px solid #cbd5e1; padding: 6px 8px; }
.report-table th { background: #1e3a8a; font-weight: 700; color: #fff; text-align: center; }
.report-table tr:nth-child(even) td { background: #f8fafc; }
.divider { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
li { margin-bottom: 4px; }
@media print {
  body { background: #fff; padding: 0; margin: 0; font-size: 8.5pt; }
  .actions-bar { display: none !important; }
  .page-container { box-shadow: none; border: none; padding: 0; max-width: 100%; }
  .section-title { page-break-after: avoid; }
  .report-table { page-break-inside: auto; }
  tr { page-break-inside: avoid; page-break-after: auto; }
}
</style>
</head>
<body>
<div class="actions-bar">
  <button onclick="window.print()" class="btn">📄 Guardar como PDF / Imprimir</button>
</div>
<div class="page-container">
${htmlBody}
</div>
</body>
</html>`;

  const paths = [htmlPath, 'Presupuestos/' + htmlPath, 'C:/Users/comun/Downloads/' + htmlPath];
  paths.forEach(p => {
    try {
      fs.writeFileSync(p, fullHtml, 'utf8');
      console.log(`[OK] Saved ${htmlPath} to ${p}`);
    } catch (err) {
      console.warn(`[LOCKED] Could not write to ${p}: ${err.message}`);
    }
  });
}

convertMdToHtml('Informe_Presupuesto_2027_Sercotel_Guadiana.md', 'Informe_Presupuesto_2027_Sercotel_Guadiana.html', 'Informe Presupuesto 2027 - Sercotel Guadiana');
convertMdToHtml('Informe_Presupuesto_2027_Hotel_Cumbria.md', 'Informe_Presupuesto_2027_Hotel_Cumbria.html', 'Informe Presupuesto 2027 - Hotel Cumbria');
