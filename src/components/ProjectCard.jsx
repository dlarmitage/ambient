import React from 'react';
import '../ProjectShowcase.css';

// Ensure URL has a protocol prefix
const ensureProtocol = (url) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    return 'https://' + url;
};

const ProjectCard = ({ project, isAdmin, onDelete, onClick }) => {
    const Wrapper = isAdmin ? 'div' : 'a';
    const props = isAdmin ? {
        className: 'project-card admin-card', // Added admin-card class for specific overrides
        onClick: onClick
    } : {
        href: ensureProtocol(project.link),
        className: 'project-card',
        target: '_blank',
        rel: 'noopener noreferrer'
    };

    return (
        <Wrapper {...props}>
            <div className="card-media">
                <img src={project.image_url} alt={project.name} />
            </div>
            <div className="card-content">
                <h2>{project.name}</h2>
                <p>{project.description}</p>
                <span className="card-cta">{isAdmin ? 'Edit' : 'learn more'}</span>
            </div>
            {isAdmin && onDelete && (
                <button
                    className="card-delete-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(project.id);
                    }}
                    aria-label="Delete app"
                >
                    🗑
                </button>
            )}
        </Wrapper>
    );
};

export default ProjectCard;
