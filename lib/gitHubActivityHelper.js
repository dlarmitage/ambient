const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Extract owner/repo from various GitHub URL formats
 * @param {string} input - URL or owner/repo format
 * @returns {string|null} - owner/repo format or null if invalid
 */
function extractRepoPath(input) {
    if (!input) return null;

    // If it's already in owner/repo format, return it
    if (!input.includes('/') || (input.match(/\//g) || []).length === 1) {
        return input;
    }

    // Try to extract from GitHub URL
    const match = input.match(/github\.com[:/]([^/]+)\/([^/]+?)(\.git)?$/i);
    if (match) {
        return `${match[1]}/${match[2]}`;
    }

    // If we can't parse it, return null
    return null;
}

/**
 * Fetch GitHub activity metrics for a repository
 * @param {string} repoPath - Repository path in format "owner/repo" or full GitHub URL
 * @returns {Promise<{lastCommitDate: Date, recentCommitsCount: number}>}
 */
async function fetchGitHubActivity(repoPath) {
    if (!repoPath || !GITHUB_TOKEN) {
        console.warn('GitHub repo path or token missing');
        return null;
    }

    // Extract owner/repo from various formats
    const normalizedPath = extractRepoPath(repoPath);
    if (!normalizedPath) {
        console.warn(`Invalid GitHub repo path format: ${repoPath}`);
        return null;
    }

    try {
        const headers = {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Ambient-Activity-Monitor'
        };

        // Fetch commits from all-time (no time restriction)
        // Returns commits sorted by date descending (most recent first)
        const commitsUrl = `${GITHUB_API_BASE}/repos/${normalizedPath}/commits?per_page=100`;
        const commitsResponse = await axios.get(commitsUrl, { headers });

        const commits = commitsResponse.data;
        if (!commits || commits.length === 0) {
            return {
                lastCommitDate: null,
                recentCommitsCount: 0
            };
        }

        // Get the most recent commit date (first in the list since results are sorted by date descending)
        const lastCommitDate = new Date(commits[0].commit.author.date);

        return {
            lastCommitDate,
            recentCommitsCount: commits.length
        };
    } catch (err) {
        if (err.response?.status === 404) {
            console.warn(`GitHub repo not found: ${normalizedPath}`);
        } else {
            console.error(`Error fetching GitHub activity for ${normalizedPath}:`, err.message);
        }
        return null;
    }
}

/**
 * Format a date as a relative time string (e.g., "2 days ago")
 * @param {Date} date
 * @returns {string}
 */
function formatRelativeTime(date) {
    if (!date) return 'Never';

    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
}

module.exports = {
    fetchGitHubActivity,
    formatRelativeTime
};
