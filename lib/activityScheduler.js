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
 * @returns {Promise<{processed: number, results: Array}>}
 */
async function updateAllActivityMetrics() {
    try {
        console.log('🔄 Starting activity metrics update...');

        // Get all apps with github_repo set
        const result = await pool.query('SELECT id, name, github_repo FROM apps WHERE github_repo IS NOT NULL');
        const apps = result.rows;

        if (apps.length === 0) {
            console.log('ℹ️  No apps with GitHub repos configured');
            return { processed: 0, results: [], message: 'No apps with GitHub repos configured' };
        }

        const results = [];

        for (const app of apps) {
            const activity = await fetchGitHubActivity(app.github_repo);

            const resultItem = {
                app_id: app.id,
                app_name: app.name,
                github_repo: app.github_repo,
                success: !!activity
            };

            if (activity) {
                await pool.query(
                    `UPDATE apps SET
                        last_commit_date = $1,
                        recent_commits_count = $2,
                        last_activity_fetch = NOW()
                    WHERE id = $3`,
                    [activity.lastCommitDate, activity.recentCommitsCount, app.id]
                );
                resultItem.commits_found = activity.recentCommitsCount;
                resultItem.last_commit = activity.lastCommitDate;
                console.log(`✓ Updated ${app.github_repo} (${activity.recentCommitsCount} commits)`);
            } else {
                // Mark when fetch was attempted even if it failed
                await pool.query(
                    `UPDATE apps SET last_activity_fetch = NOW() WHERE id = $1`,
                    [app.id]
                );
                resultItem.error = 'Failed to fetch from GitHub API';
                console.log(`✗ Failed to fetch activity for ${app.github_repo}`);
            }

            results.push(resultItem);

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('✅ Activity metrics update complete');
        return { processed: apps.length, results };
    } catch (err) {
        console.error('Error updating activity metrics:', err);
        throw err;
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
