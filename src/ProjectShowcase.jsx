import React from "react";
import { Link } from "react-router-dom";
import "./ProjectShowcase.css";
import Footer from "./Footer";
import ProjectCard from "./components/ProjectCard";

const ProjectShowcase = () => {
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [sortMode, setSortMode] = React.useState('name'); // 'name' or 'updated'

    React.useEffect(() => {
        fetch('/api/apps')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setProjects(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch apps:", err);
                setError("Failed to load apps. Please ensure the backend server is running.");
                setLoading(false);
            });
    }, []);

    const getSortedProjects = () => {
        const projectsCopy = [...projects];
        if (sortMode === 'name') {
            return projectsCopy.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // Sort by last_commit_date descending (most recent first)
            return projectsCopy.sort((a, b) => {
                if (!a.last_commit_date) return 1;
                if (!b.last_commit_date) return -1;
                return new Date(b.last_commit_date) - new Date(a.last_commit_date);
            });
        }
    };

    const sortedProjects = getSortedProjects();

    return (
        <main className="showcase-wrapper">
            <nav className="breadcrumb">
                <Link to="/" className="breadcrumb-link">Home</Link>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-current">Projects</span>
            </nav>

            <header className="showcase-header">
                <h1>Ambient Projects</h1>
            </header>

            <div className="sort-controls">
                <button
                    className={`sort-btn ${sortMode === 'name' ? 'active' : ''}`}
                    onClick={() => setSortMode('name')}
                >
                    By Name
                </button>
                <button
                    className={`sort-btn ${sortMode === 'updated' ? 'active' : ''}`}
                    onClick={() => setSortMode('updated')}
                >
                    By Last Update
                </button>
            </div>

            <section className="project-grid">
                {loading && <p>Loading apps...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && sortedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </section>
            <Footer />
        </main>
    );
};


export default ProjectShowcase; 
