const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const { scheduleActivityUpdates } = require('./lib/activityScheduler');
const { formatRelativeTime } = require('./lib/gitHubActivityHelper');

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

// Schedule activity metrics updates
if (process.env.GITHUB_TOKEN) {
  scheduleActivityUpdates();
} else {
  console.warn('⚠️  GITHUB_TOKEN not set - activity metrics will not be fetched');
}

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
      const accessToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET || 'fallback-secret-key-change-me', { expiresIn: '24h' });
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
    // Add formatted activity time to each app
    const apps = result.rows.map(app => ({
      ...app,
      activity_display: app.last_commit_date ? formatRelativeTime(new Date(app.last_commit_date)) : 'No commits yet'
    }));
    res.json(apps);
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

// Helper to ensure URL has protocol
const ensureProtocol = (url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return 'https://' + url;
};

// Normalize GitHub repo to owner/repo format
const normalizeGithubRepo = (repo) => {
  if (!repo) return repo;
  return repo.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '');
};

// Protected CRUD Routes
app.post('/api/apps', authenticateToken, async (req, res) => {
  const { name, description, image_url, pwa_available, ios_available, ios_link, ios_link_type, macos_available, macos_link, macos_link_type } = req.body;
  const link = ensureProtocol(req.body.link);
  const github_repo = normalizeGithubRepo(req.body.github_repo);
  try {
    // Get max sort order
    const maxOrderRes = await pool.query('SELECT MAX(sort_order) as max_order FROM apps');
    const nextOrder = (maxOrderRes.rows[0].max_order || 0) + 1;

    const result = await pool.query(
      'INSERT INTO apps (name, description, link, image_url, github_repo, sort_order, pwa_available, ios_available, ios_link, ios_link_type, macos_available, macos_link, macos_link_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [name, description, link, image_url, github_repo, nextOrder, pwa_available !== false, ios_available || false, ios_link || null, ios_link_type || null, macos_available || false, macos_link || null, macos_link_type || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/apps/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, pwa_available, ios_available, ios_link, ios_link_type, macos_available, macos_link, macos_link_type } = req.body;
  const link = ensureProtocol(req.body.link);
  const github_repo = normalizeGithubRepo(req.body.github_repo);
  try {
    const result = await pool.query(
      'UPDATE apps SET name = COALESCE($1, name), description = COALESCE($2, description), link = COALESCE($3, link), image_url = COALESCE($4, image_url), github_repo = COALESCE($5, github_repo), pwa_available = $7, ios_available = $8, ios_link = $9, ios_link_type = $10, macos_available = $11, macos_link = $12, macos_link_type = $13 WHERE id = $6 RETURNING *',
      [name, description, link, image_url, github_repo, id, pwa_available !== false, ios_available || false, ios_link || null, ios_link_type || null, macos_available || false, macos_link || null, macos_link_type || null]
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

// Public config for the client (non-secret values only)
app.get('/api/config', (req, res) => {
  res.json({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
  });
});

// Contact form — Turnstile-verified, rate-limited, delivered via Resend
const contactRateLimit = new Map(); // ip -> [timestamps]
const CONTACT_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_MAX_PER_WINDOW = 5;

const clientIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
  req.socket.remoteAddress ||
  'unknown';

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, turnstileToken } = req.body || {};

    if (!name || !email || !message || !turnstileToken) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (typeof message !== 'string' || message.length > 5000) {
      return res.status(400).json({ error: 'Message is too long.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const ip = clientIp(req);
    const now = Date.now();
    const history = (contactRateLimit.get(ip) || []).filter(t => now - t < CONTACT_WINDOW_MS);
    if (history.length >= CONTACT_MAX_PER_WINDOW) {
      return res.status(429).json({ error: 'Too many messages from this address. Try again later.' });
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || '',
        response: turnstileToken,
        remoteip: ip,
      }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return res.status(400).json({ error: 'Verification failed. Please try again.' });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not set');
      return res.status(500).json({ error: 'Email service not configured.' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = process.env.CONTACT_TO_EMAIL || 'hello@ambient.technology';
    const fromName = 'Ambient Technology';
    const from = `${fromName} <${to}>`;

    const safeName = String(name).slice(0, 200);
    const safeEmail = String(email).slice(0, 320);
    const plainBody = [
      `From: ${safeName} <${safeEmail}>`,
      `IP: ${ip}`,
      '',
      String(message),
    ].join('\n');

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: safeEmail,
      subject: `New message from ${safeName} via ambient.technology`,
      text: plainBody,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Could not send message. Please try again.' });
    }

    contactRateLimit.set(ip, [...history, now]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Contact endpoint error:', err);
    return res.status(500).json({ error: 'Unexpected error.' });
  }
});

// Manual activity metrics refresh endpoint
app.post('/api/activities/refresh', authenticateToken, async (req, res) => {
  try {
    const { updateAllActivityMetrics } = require('./lib/activityScheduler');
    const results = await updateAllActivityMetrics();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to update activity metrics' });
  }
});

// Export for Vercel
module.exports = app;

// Only listen if run directly (local dev)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
