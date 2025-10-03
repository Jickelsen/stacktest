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
    await client.query("INSERT INTO messages (text) VALUES ('Hello from the DB!') ON CONFLICT DO NOTHING");
  } finally {
    client.release();
  }
}

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM messages");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, async () => {
  await initDb();
  console.log(`Frontend running at http://0.0.0.0:${port}`);
});

