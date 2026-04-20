import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ProjectShowcase.css";
import Footer from "./Footer";
import ProjectCard from "./components/ProjectCard";
import ContactModal from "./ContactModal";

const ProjectShowcase = () => {
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [sortMode, setSortMode] = React.useState('name');
    const [contactOpen, setContactOpen] = useState(false);

    const openContact = (e) => {
        e.preventDefault();
        setContactOpen(true);
    };

    React.useEffect(() => {
        fetch('/api/apps')
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
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

    useEffect(() => {
        const nav = document.getElementById("showcase-nav");
        const onScroll = () => {
            if (!nav) return;
            nav.classList.toggle("scrolled", window.scrollY > 20);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const getSortedProjects = () => {
        const projectsCopy = [...projects];
        if (sortMode === 'name') {
            return projectsCopy.sort((a, b) => a.name.localeCompare(b.name));
        }
        return projectsCopy.sort((a, b) => {
            if (!a.last_commit_date) return 1;
            if (!b.last_commit_date) return -1;
            return new Date(b.last_commit_date) - new Date(a.last_commit_date);
        });
    };

    const sortedProjects = getSortedProjects();

    return (
        <div className="showcase-wrapper">
            <nav id="showcase-nav">
                <div className="brand-group">
                    <Link to="/" className="brand">
                        ambient<span className="dot">.</span>technology
                    </Link>
                    <span className="brand-crumb">/ Projects</span>
                </div>
                <div className="nav-links">
                    <a href="/#story" className="hide-mobile">Story</a>
                    <Link to="/projects" className="is-active">Projects</Link>
                    <a href="#contact" onClick={openContact}>Contact</a>
                </div>
            </nav>

            <header className="showcase-header">
                <div className="section-label">Projects · The full set</div>
                <h1 className="showcase-title">
                    Everything we're <em>building right now</em>, in one place.
                </h1>
                <p className="showcase-sub">
                    Live work and exploratory pieces alike. Some is for sale, some is free, some exists because it should exist and there was an afternoon.
                </p>
            </header>

            <div className="sort-controls">
                <span className="sort-label">Sort</span>
                <button
                    className={`sort-btn ${sortMode === 'name' ? 'active' : ''}`}
                    onClick={() => setSortMode('name')}
                >
                    By name
                </button>
                <span className="sort-sep">·</span>
                <button
                    className={`sort-btn ${sortMode === 'updated' ? 'active' : ''}`}
                    onClick={() => setSortMode('updated')}
                >
                    By last update
                </button>
            </div>

            <section className="project-grid">
                {loading && <p className="showcase-status">Loading…</p>}
                {error && <p className="showcase-status error">{error}</p>}
                {!loading && !error && sortedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </section>

            <Footer />

            <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
        </div>
    );
};

export default ProjectShowcase;
