import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ProjectShowcase.css";
import Footer from "./Footer";
import ProjectCard from "./components/ProjectCard";
import ContactModal from "./ContactModal";
import Seo from "./Seo";

const ProjectShowcase = () => {
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [sortMode, setSortMode] = React.useState('updated');
    const [contactOpen, setContactOpen] = useState(false);

    const openContact = (e) => {
        e.preventDefault();
        setContactOpen(true);
    };

    React.useEffect(() => {
        let cancelled = false;

        const loadFromSnapshot = fetch('/projects.json')
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
            .then(data => {
                if (cancelled || !Array.isArray(data)) return;
                setProjects(data);
                setLoading(false);
            });

        loadFromSnapshot.finally(() => {
            fetch('/api/apps')
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    if (cancelled) return;
                    setProjects(data);
                    setLoading(false);
                })
                .catch(err => {
                    if (cancelled) return;
                    console.error("Failed to fetch apps:", err);
                    setLoading(prev => {
                        if (!prev) return prev;
                        setError("Failed to load apps. Please ensure the backend server is running.");
                        return false;
                    });
                });
        });

        return () => { cancelled = true; };
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

    const collectionSchema = projects.length > 0 ? {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": "https://ambient.technology/projects",
                "url": "https://ambient.technology/projects",
                "name": "Projects · Ambient Technology",
                "description": "Every project Ambient Technology is building right now — live work and side explorations. Some are for sale, some are free, and some exist only because they should.",
                "isPartOf": { "@id": "https://ambient.technology/#website" },
                "publisher": { "@id": "https://ambient.technology/#org" },
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": projects.length,
                    "itemListElement": projects.map((p, i) => ({
                        "@type": "ListItem",
                        "position": i + 1,
                        "item": { "@id": `https://ambient.technology/projects#project-${p.id}` }
                    }))
                }
            },
            ...projects.map((p) => {
                const operatingSystems = [
                    p.ios_available && "iOS",
                    p.macos_available && "macOS",
                    p.pwa_available && "Web"
                ].filter(Boolean);
                const node = {
                    "@type": "SoftwareApplication",
                    "@id": `https://ambient.technology/projects#project-${p.id}`,
                    "name": p.name,
                    "description": p.description,
                    "author": { "@id": "https://ambient.technology/#org" },
                    "isPartOf": { "@id": "https://ambient.technology/projects" }
                };
                if (p.link) node.url = p.link;
                if (p.image_url) node.image = p.image_url;
                if (operatingSystems.length) node.operatingSystem = operatingSystems.join(", ");
                return node;
            })
        ]
    } : null;

    return (
        <div className="showcase-wrapper">
            <Seo
                title="Projects · Ambient Technology"
                description="Every project Ambient Technology is building right now ... live work and side explorations. Some are for sale, some are free, and some exist only because they should."
                path="/projects"
            />
            {collectionSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
                />
            )}
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
                    A mix of live projects and side explorations. Some are for sale, some are free, and some exist only because they should.
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
