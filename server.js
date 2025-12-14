const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Connected to database at:', res.rows[0].now);
  }
});

// API Routes
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-change-me', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Cannot find user' });
    }

    if (await bcrypt.compare(password, user.password_hash)) {
      const accessToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET || 'fallback-secret-key-change-me', { expiresIn: '1h' });
      res.json({ accessToken });
    } else {
      res.status(403).json({ error: 'Not Allowed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes
const axios = require('axios');
const cheerio = require('cheerio');

// ... (previous code)

// API Routes
app.get('/api/apps', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM apps ORDER BY sort_order ASC, id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// OG Scraper
app.get('/api/fetch-og', async (req, res) => {
  let { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }, // Fake UA to avoid some blocks
      timeout: 5000
    });
    const html = response.data;
    const $ = cheerio.load(html);

    // Try multiple sources for the image
    const ogImage = $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      $('link[rel="icon"]').attr('href');

    if (ogImage) {
      // Resolve relative URLs
      const absoluteImage = new URL(ogImage, url).href;
      res.json({ image: absoluteImage });
    } else {
      res.status(404).json({ error: 'No OG image found' });
    }
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
    res.status(500).json({ error: 'Failed to fetch URL' });
  }
});

// Reorder apps
app.put('/api/apps/reorder', authenticateToken, async (req, res) => {
  const { items } = req.body; // Array of { id, sort_order }

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items array' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query('UPDATE apps SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
      }
      await client.query('COMMIT');
      res.json({ message: 'Order updated' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Protected CRUD Routes
app.post('/api/apps', authenticateToken, async (req, res) => {
  const { name, description, link, image_url } = req.body;
  try {
    // Get max sort order
    const maxOrderRes = await pool.query('SELECT MAX(sort_order) as max_order FROM apps');
    const nextOrder = (maxOrderRes.rows[0].max_order || 0) + 1;

    const result = await pool.query(
      'INSERT INTO apps (name, description, link, image_url, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, link, image_url, nextOrder]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/apps/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, link, image_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE apps SET name = COALESCE($1, name), description = COALESCE($2, description), link = COALESCE($3, link), image_url = COALESCE($4, image_url) WHERE id = $5 RETURNING *',
      [name, description, link, image_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'App not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/apps/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM apps WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'App not found' });
    }
    res.json({ message: 'App deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
