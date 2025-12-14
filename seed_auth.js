const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const seedAuth = async () => {
    try {
        // Create Users Table
        const userTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        await pool.query(userTableQuery);
        console.log("Table 'users' created or exists.");

        // Check if admin exists
        const adminEmail = 'david@ambient.technology';
        const check = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

        if (check.rows.length === 0) {
            // Create Admin User
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('ambient-admin', salt);

            await pool.query(
                'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
                [adminEmail, hashedPassword]
            );
            console.log(`Admin user '${adminEmail}' created.`);
        } else {
            console.log(`Admin user '${adminEmail}' already exists.`);
        }

    } catch (err) {
        console.error('Error seeding auth:', err);
    } finally {
        pool.end();
    }
};

seedAuth();
