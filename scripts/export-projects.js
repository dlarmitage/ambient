// Snapshots the live project list into public/projects.json so that the
// prerender step can render /projects with real content (the API that
// ProjectShowcase normally hits is not running during react-snap).

const fs = require('node:fs');
const path = require('node:path');

const SOURCE_URL = process.env.PROJECTS_EXPORT_URL || 'https://www.ambient.technology/api/apps';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'projects.json');

async function main() {
    try {
        const res = await fetch(SOURCE_URL, { redirect: 'follow' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Expected an array');
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n');
        console.log(`Wrote ${data.length} projects to public/projects.json`);
    } catch (err) {
        if (fs.existsSync(OUTPUT_PATH)) {
            console.warn(`Export failed (${err.message}); keeping existing projects.json`);
        } else {
            fs.writeFileSync(OUTPUT_PATH, '[]\n');
            console.warn(`Export failed (${err.message}); wrote empty projects.json`);
        }
    }
}

main();
