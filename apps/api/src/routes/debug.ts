/**
 * Debug endpoints for database inspection. Development only.
 * Access the UI at http://localhost:4000/debug
 */

import type { FastifyInstance } from 'fastify';
import { sql } from 'drizzle-orm';
import { getDb } from '../db/client.ts';
import { isProduction } from '../env.ts';

const DEBUG_UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PGlite Browser</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a1a;
      color: #e0e0e0;
      line-height: 1.5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background: #2a2a2a;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #4CAF50;
    }
    h1 { font-size: 24px; margin-bottom: 5px; }
    .subtitle { color: #999; font-size: 14px; }

    .main-grid {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 20px;
      min-height: 500px;
    }

    .sidebar {
      background: #2a2a2a;
      border-radius: 8px;
      padding: 15px;
      overflow-y: auto;
      max-height: 600px;
    }

    .sidebar h2 {
      font-size: 14px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 10px;
      margin-top: 15px;
    }

    .sidebar h2:first-child { margin-top: 0; }

    .table-list button {
      display: block;
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 5px;
      background: #333;
      border: 1px solid #444;
      color: #e0e0e0;
      border-radius: 4px;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
      transition: all 0.2s;
    }

    .table-list button:hover {
      background: #404040;
      border-color: #555;
    }

    .table-list button.active {
      background: #4CAF50;
      border-color: #45a049;
      color: white;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .panel {
      background: #2a2a2a;
      border-radius: 8px;
      padding: 20px;
    }

    .query-panel {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .query-panel label {
      font-size: 13px;
      color: #999;
      text-transform: uppercase;
    }

    textarea, input {
      background: #1a1a1a;
      border: 1px solid #444;
      color: #e0e0e0;
      padding: 10px;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      resize: vertical;
    }

    textarea:focus, input:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
    }

    button[type="submit"] {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    button[type="submit"]:hover {
      background: #45a049;
    }

    button[type="submit"]:disabled {
      background: #666;
      cursor: not-allowed;
    }

    .results {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 400px;
      overflow-y: auto;
    }

    .results-empty {
      color: #666;
      font-size: 13px;
      text-align: center;
      padding: 40px 20px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    th {
      background: #1a1a1a;
      padding: 8px 12px;
      text-align: left;
      border-bottom: 2px solid #4CAF50;
      color: #4CAF50;
      font-weight: 600;
    }

    td {
      padding: 8px 12px;
      border-bottom: 1px solid #444;
      word-break: break-all;
    }

    tr:hover { background: #333; }

    .error {
      background: #3a2a2a;
      border: 1px solid #6a3a3a;
      color: #ff6b6b;
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: 'Monaco', 'Courier New', monospace;
    }

    .success {
      background: #2a3a2a;
      border: 1px solid #3a6a3a;
      color: #6bff6b;
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
    }

    .loading {
      color: #999;
      font-style: italic;
    }

    .row-count {
      color: #999;
      font-size: 12px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🗄️ PGlite Browser</h1>
      <p class="subtitle">Database inspection tool for zBhaga API</p>
    </header>

    <div class="main-grid">
      <aside class="sidebar">
        <h2>Tables</h2>
        <div class="table-list" id="tableList"></div>
      </aside>

      <main class="content">
        <div class="panel query-panel">
          <label for="queryInput">SQL Query</label>
          <textarea id="queryInput" placeholder="SELECT * FROM users;" rows="4"></textarea>
          <button type="submit" onclick="executeQuery()">Execute Query</button>
        </div>

        <div class="panel">
          <div id="message"></div>
          <div id="results" class="results"></div>
          <div id="rowCount" class="row-count"></div>
        </div>
      </main>
    </div>
  </div>

  <script>
    const tables = ['users', 'identities', 'refresh_tokens', 'groups', 'members', 'expenses', 'settlements'];

    function loadTables() {
      const list = document.getElementById('tableList');
      tables.forEach(table => {
        const btn = document.createElement('button');
        btn.textContent = table;
        btn.onclick = () => selectTable(table, btn);
        list.appendChild(btn);
      });
    }

    function selectTable(table, btn) {
      document.querySelectorAll('.table-list button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('queryInput').value = \`SELECT * FROM \${table};\`;
      executeQuery();
    }

    async function executeQuery() {
      const query = document.getElementById('queryInput').value.trim();
      if (!query) return;

      const msgDiv = document.getElementById('message');
      const resultsDiv = document.getElementById('results');
      const rowCountDiv = document.getElementById('rowCount');

      msgDiv.innerHTML = '<p class="loading">Executing...</p>';
      resultsDiv.innerHTML = '';
      rowCountDiv.innerHTML = '';

      try {
        const response = await fetch('/debug/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });

        const data = await response.json();

        if (!response.ok) {
          msgDiv.innerHTML = \`<div class="error">\${data.error || 'Query failed'}</div>\`;
          return;
        }

        if (data.rows.length === 0) {
          msgDiv.innerHTML = '<div class="success">Query executed (no results)</div>';
          resultsDiv.innerHTML = '<div class="results-empty">No rows returned</div>';
          return;
        }

        msgDiv.innerHTML = '<div class="success">Query executed successfully</div>';

        const columns = Object.keys(data.rows[0]);
        let html = '<table><thead><tr>';
        columns.forEach(col => {
          html += \`<th>\${escapeHtml(col)}</th>\`;
        });
        html += '</tr></thead><tbody>';

        data.rows.forEach(row => {
          html += '<tr>';
          columns.forEach(col => {
            const val = row[col];
            const display = val === null ? '<em>null</em>' : escapeHtml(String(val).substring(0, 100));
            html += \`<td>\${display}</td>\`;
          });
          html += '</tr>';
        });
        html += '</tbody></table>';

        resultsDiv.innerHTML = html;
        rowCountDiv.innerHTML = \`<strong>\${data.rows.length}</strong> row(s)\`;
      } catch (err) {
        msgDiv.innerHTML = \`<div class="error">\${err.message}</div>\`;
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    loadTables();

    document.getElementById('queryInput').addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        executeQuery();
      }
    });
  </script>
</body>
</html>`;

export default async function debugRoutes(app: FastifyInstance): Promise<void> {
  if (isProduction) return;

  const db = await getDb();
  app.addHook('preHandler', app.requireAuth);

  app.get('/debug', async (request, reply) => {
    reply.type('text/html').send(DEBUG_UI_HTML);
  });

  app.post<{ Body: { query: string } }>('/debug/query', async (request) => {
    const { query } = request.body;
    if (!query || typeof query !== 'string') {
      return { error: 'Query is required' };
    }

    try {
      const result = await db.execute(sql.raw(query) as any);
      return { rows: (result as any).rows || [] };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Query failed' };
    }
  });

  app.get('/debug/tables', async () => {
    try {
      const result = await db.execute(sql.raw(`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `) as any);
      return { tables: ((result as any).rows || []).map((r: any) => r.tablename) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch tables' };
    }
  });
}
