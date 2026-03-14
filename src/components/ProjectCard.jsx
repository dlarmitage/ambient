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
                {project.last_commit_date && project.recent_commits_count !== undefined && (
                    <div className="activity-badge">
                        <span className="activity-indicator">●</span>
                        <div className="activity-content">
                            <span className="activity-left">Last commit: {project.activity_display}</span>
                            <span className="activity-right">{project.recent_commits_count === 100 ? '100+' : project.recent_commits_count} commits</span>
                        </div>
                    </div>
                )}

                {/* Platform Badges */}
                {(project.pwa_available || project.ios_available || project.macos_available) && (
                    <div className="platform-badges">
                        {project.pwa_available && (
                            <div className="platform-badge" title="Progressive Web App">
                                🌐
                            </div>
                        )}
                        {project.ios_available && project.ios_link && (
                            <a href={ensureProtocol(project.ios_link)} target="_blank" rel="noopener noreferrer" className="platform-badge" title={`iOS - ${project.ios_link_type === 'app_store' ? 'App Store' : project.ios_link_type === 'testflight' ? 'TestFlight' : 'Custom'}`}>
                                📱
                            </a>
                        )}
                        {project.macos_available && project.macos_link && (
                            <a href={ensureProtocol(project.macos_link)} target="_blank" rel="noopener noreferrer" className="platform-badge" title={`macOS - ${project.macos_link_type === 'app_store' ? 'App Store' : project.macos_link_type === 'testflight' ? 'TestFlight' : project.macos_link_type === 'dmg' ? 'DMG' : 'Custom'}`}>
                                💻
                            </a>
                        )}
                    </div>
                )}
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
