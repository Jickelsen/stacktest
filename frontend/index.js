const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 8080;

const dbUrl = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: dbUrl });

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query("CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, text TEXT)");
    // Insert a default row if table is empty
    const { rowCount } = await client.query("SELECT 1 FROM messages LIMIT 1");
    if (rowCount === 0) {
      await client.query("INSERT INTO messages (text) VALUES ('Hello from the DB!')");
    }
  } finally {
    client.release();
  }
}

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM messages ORDER BY id ASC");
    const rows = result.rows;

    // Build a simple HTML page
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DB Messages</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; }
          h1 { color: #333; }
          table { border-collapse: collapse; margin-top: 1rem; }
          th, td { border: 1px solid #ccc; padding: 8px 12px; }
          th { background: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>Messages from the DB</h1>
        <table>
          <tr><th>ID</th><th>Text</th></tr>
          ${rows.map(r => `<tr><td>${r.id}</td><td>${r.text}</td></tr>`).join("")}
        </table>
      </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    res.status(500).send(`<pre>Error: ${err.message}</pre>`);
  }
});

app.listen(port, async () => {
  await initDb();
  console.log(`Frontend running at http://0.0.0.0:${port}`);
});

