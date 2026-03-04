const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const migrate = async () => {
    try {
        const migrations = [
            // Add github_repo column
            `ALTER TABLE apps ADD COLUMN IF NOT EXISTS github_repo TEXT;`,
            // Add activity tracking columns
            `ALTER TABLE apps ADD COLUMN IF NOT EXISTS last_commit_date TIMESTAMP;`,
            `ALTER TABLE apps ADD COLUMN IF NOT EXISTS recent_commits_count INTEGER DEFAULT 0;`,
            `ALTER TABLE apps ADD COLUMN IF NOT EXISTS last_activity_fetch TIMESTAMP;`,
        ];

        for (const migration of migrations) {
            await pool.query(migration);
            console.log(`✓ Migration executed: ${migration.substring(0, 50)}...`);
        }

        console.log('All migrations completed successfully!');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        pool.end();
    }
};

migrate();
