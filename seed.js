const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const products = [
    {
        name: "News Check",
        description: "Instantly spot bias & misinformation with AI-driven article analysis and credibility scores.",
        link: "https://news-check.org",
        image_url: "/images/news-check.webp",
    },
    {
        name: "Ask Alice",
        description: "AI-powered clinical supervision & role-play assistant for mental-health professionals.",
        link: "https://askalice.app",
        image_url: "/images/askalice.webp",
    },
    {
        name: "Crush the Interview",
        description: "AI interview coach offering mock sessions, feedback & confidence boosts before your big day.",
        link: "https://crush-the-interview.com",
        image_url: "/images/crush-the-interview.webp",
    },
    {
        name: "PhotoLog",
        description: "PhotoLog combines the best of travel documentation with AI-powered cultural intelligence, creating experiences no other app can match.",
        link: "https://www.photolog.app",
        image_url: "/images/photolog.webp",
    },
    {
        name: "Podcast Creator",
        description: "Turn articles & ideas into polished podcast scripts and audio in minutes with AI.",
        link: "https://podcast-creator.com",
        image_url: "/images/podcast-creator.webp",
    },
    {
        name: "PracticePerfect",
        description: "Track and gamify your daily practice sessions to hit skill-building goals faster.",
        link: "https://practiceperfect.online",
        image_url: "/images/practiceperfect.webp",
    },
    {
        name: "QR Creator",
        description: "Generate high-quality QR codes for URLs, contacts, and more — free, no sign-in.",
        link: "https://theQR.guru",
        image_url: "/images/qr-creator.webp",
    },
    {
        name: "Explore Venao",
        description: "Discover culture, real-estate, and adventure in Playa Venao, Panama.",
        link: "https://www.venao.online",
        image_url: "/images/venao.webp",
    },
];

const seedSchema = `
  CREATE TABLE IF NOT EXISTS apps (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    link TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const seedData = async () => {
    try {
        // Create Table
        await pool.query(seedSchema);
        console.log("Table 'apps' created or already exists.");

        // Check if data exists
        const check = await pool.query('SELECT COUNT(*) FROM apps');
        if (parseInt(check.rows[0].count) > 0) {
            console.log('Table already seeded. Skipping insertion.');
        } else {
            // Insert Data
            for (const product of products) {
                const query = 'INSERT INTO apps (name, description, link, image_url) VALUES ($1, $2, $3, $4)';
                const values = [product.name, product.description, product.link, product.image_url];
                await pool.query(query, values);
                console.log(`Inserted: ${product.name}`);
            }
            console.log('Seeding complete.');
        }
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        pool.end();
    }
};

seedData();
