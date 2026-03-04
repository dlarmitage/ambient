const { Pool } = require('pg');
const { fetchGitHubActivity } = require('./gitHubActivityHelper');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

/**
 * Update activity metrics for all apps with GitHub repos
 */
async function updateAllActivityMetrics() {
    try {
        console.log('🔄 Starting activity metrics update...');

        // Get all apps with github_repo set
        const result = await pool.query('SELECT id, github_repo FROM apps WHERE github_repo IS NOT NULL');
        const apps = result.rows;

        if (apps.length === 0) {
            console.log('ℹ️  No apps with GitHub repos configured');
            return;
        }

        for (const app of apps) {
            const activity = await fetchGitHubActivity(app.github_repo);

            if (activity) {
                await pool.query(
                    `UPDATE apps SET
                        last_commit_date = $1,
                        recent_commits_count = $2,
                        last_activity_fetch = NOW()
                    WHERE id = $3`,
                    [activity.lastCommitDate, activity.recentCommitsCount, app.id]
                );
                console.log(`✓ Updated ${app.github_repo} (${activity.recentCommitsCount} commits)`);
            } else {
                // Mark when fetch was attempted even if it failed
                await pool.query(
                    `UPDATE apps SET last_activity_fetch = NOW() WHERE id = $1`,
                    [app.id]
                );
                console.log(`✗ Failed to fetch activity for ${app.github_repo}`);
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('✅ Activity metrics update complete');
    } catch (err) {
        console.error('Error updating activity metrics:', err);
    }
}

/**
 * Schedule activity metrics updates
 * Runs on startup and then every 24 hours
 */
function scheduleActivityUpdates() {
    // Run immediately on startup
    updateAllActivityMetrics();

    // Then run every 24 hours (86400000 ms)
    const updateInterval = setInterval(() => {
        updateAllActivityMetrics();
    }, 24 * 60 * 60 * 1000);

    // Store interval ID for potential cleanup
    return updateInterval;
}

module.exports = {
    updateAllActivityMetrics,
    scheduleActivityUpdates
};
