// Wiring only: the grid does the editing, validation, filtering and export.
// Labels live in the browser only (localStorage, every access in try/catch).
const { createGrid } = LatticeGrid;
const LABELS = ['ham', 'spam', 'unsure'];
const STORE = 'lattice-demo-labelling-1634';
const el = (id) => document.getElementById(id);
el('version').textContent = LatticeGrid.getVersion ? LatticeGrid.getVersion() : '';

/** @returns {Record<string,string>} the saved id -> label map, or {} when storage is unavailable. */
function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } }
/** Save the id -> label map; reports (once, in the status line) when storage refuses. */
function save(labels) {
  try { localStorage.setItem(STORE, JSON.stringify(labels)); } catch { el('status').textContent = 'Storage is off: labels last until you close this tab.'; }
}

const saved = load();
const rows = (await (await fetch('sms.json?v=20261005a')).json())
  .map((r) => ({ ...r, label: saved[r.id] || '' }));
const statusOf = ({ label, uci }) => (!label ? 'unlabelled' : label === uci ? 'agrees' : 'disagrees');

const grid = createGrid(el('grid'), {
  rowKey: 'id', rows, selection: 'single', edit: true,
  columns: [
    { id: 'id', title: 'ID', type: 'number', layout: { width: 70 } },
    { id: 'text', title: 'Message', type: 'text', layout: { width: 560 } },
    { id: 'uci', title: 'UCI label', type: 'text', layout: { width: 100 } },
    { id: 'label', title: 'My label', type: 'text', layout: { width: 120 },
      lookup: { options: LABELS.map((l) => ({ id: l, label: l })) },
      edit: { enabled: true, editor: 'select' },
      validation: { oneOf: LABELS, message: 'Choose ham, spam or unsure.' } },
    { id: 'status', title: 'Status', type: 'text', layout: { width: 110 },
      value: { compute: (d) => statusOf(d), deps: ['label', 'uci'] }, export: { csv: false } },
  ],
});

// Label counts over the whole dataset (not just the filtered view), kept live on every edit.
const kpi = LatticeGridKPI.createKPI(el('kpi'), {
  rows: rows.map((r) => ({ ...r })), rowKey: 'id', columns: 5, fields: ['label', 'uci'],
  tiles: [
    { id: 'total', label: 'Messages', aggregation: 'count' },
    { id: 'unlabelled', label: 'Unlabelled', aggregation: 'count', filter: (r) => !r.label },
    ...LABELS.map((l) => ({ id: l, label: l[0].toUpperCase() + l.slice(1), aggregation: 'count', filter: (r) => r.label === l })),
  ],
});

grid.on('cell:changed', ({ key, colId, value }) => {
  if (colId !== 'label') return;
  const row = rows.find((r) => String(r.id) === String(key));
  row.label = value || '';
  if (row.label) saved[row.id] = row.label; else delete saved[row.id];
  save(saved);
  kpi.setRows(rows.map((r) => ({ ...r })));
});

// Review queue: a filter on the computed Status column.
for (const b of document.querySelectorAll('[data-queue]')) {
  b.addEventListener('click', () => {
    grid.filters.set(b.dataset.queue === 'all' ? null : { col: 'status', op: 'eq', value: b.dataset.queue });
    for (const o of document.querySelectorAll('[data-queue]')) o.setAttribute('aria-pressed', String(o === b));
    el('status').textContent = `${grid.rows.count()} rows in this queue.`;
  });
}
const csvOptions = { columns: ['id', 'text', 'uci', 'label'], sanitise: false, fileName: 'labels.csv' };
el('export').addEventListener('click', () => { grid.export.csv({ ...csvOptions, download: true }); });
el('reset').addEventListener('click', () => {
  for (const r of rows) { r.label = ''; delete saved[r.id]; }
  save(saved);
  grid.rows.load(rows.map((r) => ({ ...r })));
  kpi.setRows(rows.map((r) => ({ ...r })));
});
window.__demo = { grid, kpi, rows, csvOptions };
