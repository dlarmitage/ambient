const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const migration = async () => {
    try {
        console.log('Adding platform metadata columns to apps table...');

        // Add platform availability flags
        await pool.query('ALTER TABLE apps ADD COLUMN IF NOT EXISTS pwa_available BOOLEAN DEFAULT true');
        console.log('✓ Added pwa_available column');

        // iOS columns
        await pool.query('ALTER TABLE apps ADD COLUMN IF NOT EXISTS ios_available BOOLEAN DEFAULT false');
        await pool.query('ALTER TABLE apps ADD COLUMN IF NOT EXISTS ios_link TEXT');
        await pool.query('ALTER TABLE apps ADD COLUMN IF NOT EXISTS ios_link_type TEXT');
        console.log('✓ Added iOS platform columns');

        // macOS columns
        await pool.query('ALTER TABLE apps ADD COLUMN IF NOT EXISTS macos_available BOOLEAN DEFAULT false');
        await pool.query('ALTER TABLE apps ADD COLUMN IF NOT EXISTS macos_link TEXT');
        await pool.query('ALTER TABLE apps ADD COLUMN IF NOT EXISTS macos_link_type TEXT');
        console.log('✓ Added macOS platform columns');

        // Update all existing apps to have pwa_available = true (since all current apps are PWAs)
        const result = await pool.query('UPDATE apps SET pwa_available = true WHERE pwa_available IS NULL');
        console.log(`✓ Marked ${result.rowCount} existing apps as PWA available`);

        console.log('\nMigration completed successfully!');
    } catch (err) {
        console.error('Error during migration:', err);
        process.exit(1);
    } finally {
        pool.end();
    }
};

migration();
