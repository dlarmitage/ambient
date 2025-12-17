import React from "react";
import { Link } from "react-router-dom";
import "./ProjectShowcase.css";
import Footer from "./Footer";
import ProjectCard from "./components/ProjectCard";

const ProjectShowcase = () => {
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

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

            <section className="project-grid">
                {loading && <p>Loading apps...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </section>
            <Footer />
        </main>
    );
};


export default ProjectShowcase; 
