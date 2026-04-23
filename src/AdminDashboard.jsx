import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import SortableProjectCard from './components/SortableProjectCard';
import ProjectCard from './components/ProjectCard';
import './Admin.css';
import './ProjectShowcase.css';

Modal.setAppElement('#root');

const AdminDashboard = ({ token, onLogout }) => {
    const authFetch = async (url, options = {}) => {
        const res = await fetch(url, options);
        if (res.status === 401 || res.status === 403) {
            alert('Session expired. Please log in again.');
            onLogout();
            return null;
        }
        return res;
    };

    const [apps, setApps] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        link: '',
        image_url: '',
        github_repo: '',
        pwa_available: true,
        ios_available: false,
        ios_link: '',
        ios_link_type: 'app_store',
        macos_available: false,
        macos_link: '',
        macos_link_type: 'app_store'
    });
    const [fetchingOg, setFetchingOg] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [refreshingActivity, setRefreshingActivity] = useState(false);
    const [refreshResults, setRefreshResults] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchApps();
    }, []);

    useEffect(() => {
        const nav = document.getElementById('admin-nav');
        const onScroll = () => {
            if (!nav) return;
            nav.classList.toggle('scrolled', window.scrollY > 20);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const fetchApps = async () => {
        try {
            const res = await fetch('/api/apps');
            const data = await res.json();
            setApps(data);
        } catch (err) {
            console.error('Failed to fetch apps', err);
        }
    };

    const handleDragStart = (event) => { setActiveId(event.active.id); };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over.id) {
            const oldIndex = apps.findIndex((app) => app.id === active.id);
            const newIndex = apps.findIndex((app) => app.id === over.id);
            const newApps = arrayMove(apps, oldIndex, newIndex);
            setApps(newApps);

            const itemsToUpdate = newApps.map((app, i) => ({ id: app.id, sort_order: i + 1 }));

            try {
                await authFetch('/api/apps/reorder', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ items: itemsToUpdate })
                });
            } catch (err) {
                console.error('Failed to save order', err);
                fetchApps();
            }
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            name: '', description: '', link: '', image_url: '', github_repo: '',
            pwa_available: true,
            ios_available: false, ios_link: '', ios_link_type: 'app_store',
            macos_available: false, macos_link: '', macos_link_type: 'app_store'
        });
        setModalIsOpen(true);
    };

    const openEditModal = (app) => {
        setEditingId(app.id);
        setFormData({
            name: app.name,
            description: app.description,
            link: app.link,
            image_url: app.image_url,
            github_repo: app.github_repo || '',
            pwa_available: app.pwa_available !== false,
            ios_available: app.ios_available || false,
            ios_link: app.ios_link || '',
            ios_link_type: app.ios_link_type || 'app_store',
            macos_available: app.macos_available || false,
            macos_link: app.macos_link || '',
            macos_link_type: app.macos_link_type || 'app_store'
        });
        setModalIsOpen(true);
    };

    const closeModal = () => setModalIsOpen(false);

    const handleFetchOg = async () => {
        if (!formData.link) return alert('Please enter a Link URL first.');
        setFetchingOg(true);
        try {
            const res = await fetch(`/api/fetch-og?url=${encodeURIComponent(formData.link)}`);
            const data = await res.json();
            if (data.image) {
                setFormData(prev => ({ ...prev, image_url: data.image }));
            } else {
                alert('No OG image found for this URL.');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to fetch OG image.');
        } finally {
            setFetchingOg(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const url = editingId ? `/api/apps/${editingId}` : '/api/apps';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await authFetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (!res) return;
            if (res.ok) {
                fetchApps();
                closeModal();
            } else {
                alert('Failed to save app');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving app');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this app?')) return;
        try {
            const res = await authFetch(`/api/apps/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res) return;
            if (res.ok) {
                fetchApps();
            } else {
                alert('Failed to delete app');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRefreshActivity = async () => {
        setRefreshingActivity(true);
        setRefreshResults(null);
        try {
            const res = await authFetch('/api/activities/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res) return;
            const data = await res.json();
            if (res.ok) {
                fetchApps();
                setRefreshResults({ success: true, data });
                setTimeout(() => setRefreshResults(null), 2500);
            } else {
                setRefreshResults({ success: false, error: data.error || 'Failed to refresh' });
            }
        } catch (err) {
            console.error(err);
            setRefreshResults({ success: false, error: err.message });
        } finally {
            setRefreshingActivity(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch('/api/activities/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (err) {
            console.error('Activity refresh on logout failed', err);
        } finally {
            onLogout();
        }
    };

    const activeApp = activeId ? apps.find(a => a.id === activeId) : null;

    return (
        <div className="admin-dashboard">
            <nav id="admin-nav">
                <div className="brand-group">
                    <Link to="/" className="brand">
                        ambient<span className="dot">.</span>technology
                    </Link>
                    <span className="brand-crumb">/ Admin</span>
                </div>
                <div className="nav-links">
                    <button
                        type="button"
                        onClick={handleRefreshActivity}
                        disabled={refreshingActivity}
                        className="nav-action"
                    >
                        {refreshingActivity ? 'Refreshing…' : 'Refresh activity'}
                    </button>
                    <Link to="/projects" className="hide-mobile">View site</Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="nav-action"
                    >
                        {loggingOut ? 'Logging out…' : 'Logout'}
                    </button>
                </div>
            </nav>

            <header className="admin-header">
                <div className="section-label">Admin · Project management</div>
                <h1 className="admin-title">
                    Manage <em>every project</em> in one place.
                </h1>
                <p className="admin-sub">
                    Drag to reorder. Click a card to edit. Use the plus button to add a new project.
                </p>
            </header>

            {refreshResults && (
                <div className={`admin-banner ${refreshResults.success ? 'is-success' : 'is-error'}`}>
                    <div className="admin-banner-head">
                        {refreshResults.success ? 'Refresh completed' : 'Refresh failed'}
                    </div>
                    {!refreshResults.success && (
                        <pre className="admin-banner-body">{refreshResults.error}</pre>
                    )}
                    <button
                        type="button"
                        onClick={() => setRefreshResults(null)}
                        className="admin-banner-dismiss"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="project-grid admin-grid">
                    <SortableContext
                        items={apps.map(a => a.id)}
                        strategy={rectSortingStrategy}
                    >
                        {apps.map(app => (
                            <SortableProjectCard
                                key={app.id}
                                project={app}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        ))}
                    </SortableContext>
                </div>

                <DragOverlay>
                    {activeApp ? (
                        <div className="admin-drag-overlay">
                            <ProjectCard project={activeApp} isAdmin={true} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <button
                className="add-fab"
                onClick={openAddModal}
                title="Add new project"
                aria-label="Add new project"
            >
                +
            </button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="App Editor"
                className="ReactModal__Content admin-editor"
                overlayClassName="ReactModal__Overlay admin-editor-overlay"
            >
                <div className="modal-header">
                    <div className="modal-eyebrow">{editingId ? 'Editing' : 'New project'}</div>
                    <h2>{editingId ? formData.name || 'Untitled' : 'Add a new project'}</h2>
                    <button onClick={closeModal} className="close-btn" aria-label="Close">×</button>
                </div>

                <form onSubmit={handleSave} className="modal-body">
                    <div className="modal-form-section">
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={4}
                            />
                        </div>

                        <div className="form-group">
                            <label>Link URL</label>
                            <input
                                value={formData.link}
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Image URL</label>
                            <div className="input-with-action">
                                <input
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleFetchOg}
                                    disabled={fetchingOg}
                                    className="action-btn"
                                >
                                    {fetchingOg ? '…' : 'Fetch OG'}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>GitHub repo <span className="form-hint">(owner/repo)</span></label>
                            <input
                                value={formData.github_repo}
                                onChange={e => {
                                    const val = e.target.value
                                        .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
                                        .replace(/\/$/, '');
                                    setFormData({ ...formData, github_repo: val });
                                }}
                                placeholder="e.g., darmitage/news-check"
                            />
                        </div>

                        <div className="form-section">
                            <h3 className="form-section-title">Platform availability</h3>

                            <div className="platform-section">
                                <label className="platform-toggle">
                                    <input
                                        type="checkbox"
                                        checked={formData.pwa_available}
                                        onChange={e => setFormData({ ...formData, pwa_available: e.target.checked })}
                                    />
                                    <span>Progressive Web App (PWA)</span>
                                </label>
                            </div>

                            <div className="platform-section">
                                <label className="platform-toggle">
                                    <input
                                        type="checkbox"
                                        checked={formData.ios_available}
                                        onChange={e => setFormData({ ...formData, ios_available: e.target.checked })}
                                    />
                                    <span>iOS app</span>
                                </label>
                                {formData.ios_available && (
                                    <div className="platform-detail">
                                        <div className="platform-radios">
                                            {['app_store', 'testflight', 'custom'].map(type => (
                                                <label key={type} className="platform-radio">
                                                    <input
                                                        type="radio"
                                                        value={type}
                                                        checked={formData.ios_link_type === type}
                                                        onChange={e => setFormData({ ...formData, ios_link_type: e.target.value })}
                                                    />
                                                    <span>
                                                        {type === 'app_store' ? 'App Store' : type === 'testflight' ? 'TestFlight' : 'Custom URL'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        <input
                                            type="url"
                                            placeholder={`iOS ${formData.ios_link_type === 'app_store' ? 'App Store' : formData.ios_link_type === 'testflight' ? 'TestFlight' : ''} link`}
                                            value={formData.ios_link}
                                            onChange={e => setFormData({ ...formData, ios_link: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="platform-section">
                                <label className="platform-toggle">
                                    <input
                                        type="checkbox"
                                        checked={formData.macos_available}
                                        onChange={e => setFormData({ ...formData, macos_available: e.target.checked })}
                                    />
                                    <span>macOS app</span>
                                </label>
                                {formData.macos_available && (
                                    <div className="platform-detail">
                                        <div className="platform-radios">
                                            {['app_store', 'testflight', 'dmg', 'custom'].map(type => (
                                                <label key={type} className="platform-radio">
                                                    <input
                                                        type="radio"
                                                        value={type}
                                                        checked={formData.macos_link_type === type}
                                                        onChange={e => setFormData({ ...formData, macos_link_type: e.target.value })}
                                                    />
                                                    <span>
                                                        {type === 'app_store' ? 'App Store' : type === 'testflight' ? 'TestFlight' : type === 'dmg' ? 'DMG' : 'Custom URL'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        <input
                                            type="url"
                                            placeholder={`macOS ${formData.macos_link_type === 'app_store' ? 'App Store' : formData.macos_link_type === 'testflight' ? 'TestFlight' : formData.macos_link_type === 'dmg' ? 'DMG' : ''} link`}
                                            value={formData.macos_link}
                                            onChange={e => setFormData({ ...formData, macos_link: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-preview-section">
                        <div className="preview-label">Live preview</div>
                        <div className="preview-card-wrap">
                            <ProjectCard
                                project={{
                                    ...formData,
                                    id: 'preview',
                                    image_url: formData.image_url || 'https://placehold.co/320x180/EDE8DD/8A8075?text=Preview'
                                }}
                                isAdmin={false}
                            />
                        </div>
                    </div>
                </form>

                <div className="modal-footer">
                    <button type="button" onClick={closeModal} className="cancel-btn">Cancel</button>
                    <button type="button" onClick={handleSave} className="admin-btn">
                        {editingId ? 'Update project' : 'Create project'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
