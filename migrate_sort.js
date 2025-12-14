const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const migration = async () => {
    try {
        // Add sort_order column if not exists
        await pool.query('ALTER TABLE apps ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0');
        console.log("Column 'sort_order' added.");

        // Initialize sort_order
        const apps = await pool.query('SELECT id FROM apps ORDER BY id');
        let order = 1;
        for (const row of apps.rows) {
            await pool.query('UPDATE apps SET sort_order = $1 WHERE id = $2', [order, row.id]);
            order++;
        }
        console.log("Initialized 'sort_order' for existing apps.");
    } catch (err) {
        console.error('Error migrating DB:', err);
    } finally {
        pool.end();
    }
};

migration();
