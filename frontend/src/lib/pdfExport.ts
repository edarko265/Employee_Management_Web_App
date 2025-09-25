export function exportTableToPDF(params: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  footerNote?: string;
}) {
  const { title, headers, rows, filename, footerNote } = params;

  const style = `
    <style>
      * { box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #111827; }
      h1 { font-size: 20px; margin: 0 0 12px; color: #39092c; }
      .meta { font-size: 12px; color: #6b7280; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12px; text-align: left; }
      th { background: #f3e8ff; color: #39092c; }
      tr:nth-child(even) td { background: #fafafa; }
      .footer { margin-top: 16px; font-size: 11px; color: #6b7280; }
    </style>
  `;

  const thead = `<thead><tr>${headers.map(h => `<th>${escapeHtml(String(h))}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map(r => `<tr>${r.map(c => `<td>${escapeHtml(String(c ?? ''))}</td>`).join('')}</tr>`)
    .join('')}</tbody>`;

  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    ${style}
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">Generated ${new Date().toLocaleString()}</div>
    <table>
      ${thead}
      ${tbody}
    </table>
    ${footerNote ? `<div class="footer">${escapeHtml(footerNote)}</div>` : ''}
    <script>
      window.onload = function() {
        setTimeout(function(){
          window.focus();
          window.print();
        }, 200);
      }
    </script>
  </body>
  </html>`;

  // Try to open a new window and write the content for printing/saving as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow && printWindow.document) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    return;
  }

  // Fallback: open via blob URL to avoid popup blockers
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

