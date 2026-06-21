// ──────────────────────────────────────────────────────────────────────────
// EXPORTADOR DE REPORTES
// CSV: descarga real vía Blob. PDF: abre una ventana con el reporte maquetado
// y dispara la impresión del navegador (Guardar como PDF) — sin dependencias.
// ──────────────────────────────────────────────────────────────────────────

/** Descarga un CSV a partir de filas (la primera fila es el encabezado). */
export function descargarCSV(nombre: string, filas: (string | number)[][]) {
  const csv = filas
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

/** Abre el reporte maquetado e invoca imprimir (Guardar como PDF). */
export function imprimirReporte(titulo: string, contenidoHtml: string) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${titulo}</title>
  <style>
    @page { margin: 22mm 18mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; }
    h1 { font-size: 22px; margin: 0 0 2px; }
    .sub { color: #64748b; font-size: 12px; margin-bottom: 18px; }
    .kpis { display: flex; gap: 14px; margin: 14px 0 22px; }
    .kpi { flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; }
    .kpi .l { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; }
    .kpi .v { font-size: 22px; font-weight: 600; margin-top: 4px; }
    h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .1em; color: #64748b; margin: 20px 0 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 7px 8px; border-bottom: 1px solid #eef2f6; }
    th { color: #94a3b8; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
    td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
    .foot { margin-top: 26px; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  </style></head><body>${contenidoHtml}
  <div class="foot">NEXIA · Inteligencia Operativa · Reporte generado el ${new Date().toLocaleString("es-ES")} · Datos de demostración</div>
  </body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}
