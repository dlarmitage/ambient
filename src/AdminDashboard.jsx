import React, { useState, useEffect } from 'react';
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
    const [activeId, setActiveId] = useState(null); // ID of item being dragged
    const [refreshingActivity, setRefreshingActivity] = useState(false);
    const [refreshResults, setRefreshResults] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement to start drag (prevents accidental drags on clicks)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchApps();
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

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over.id) {
            const oldIndex = apps.findIndex((app) => app.id === active.id);
            const newIndex = apps.findIndex((app) => app.id === over.id);

            const newApps = arrayMove(apps, oldIndex, newIndex);
            setApps(newApps); // Optimistic update

            // Sync to backend
            const itemsToUpdate = newApps.map((app, i) => ({
                id: app.id,
                sort_order: i + 1
            }));

            try {
                await fetch('/api/apps/reorder', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ items: itemsToUpdate })
                });
            } catch (err) {
                console.error("Failed to save order", err);
                fetchApps(); // Revert on error
            }
        }
    };

    // Modal Actions
    const openAddModal = () => {
        setEditingId(null);
        setFormData({
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

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleFetchOg = async () => {
        if (!formData.link) return alert("Please enter a Link URL first.");
        setFetchingOg(true);
        try {
            const res = await fetch(`/api/fetch-og?url=${encodeURIComponent(formData.link)}`);
            const data = await res.json();
            if (data.image) {
                setFormData(prev => ({ ...prev, image_url: data.image }));
            } else {
                alert("No OG image found for this URL.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to fetch OG image.");
        } finally {
            setFetchingOg(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const url = editingId
            ? `/api/apps/${editingId}`
            : '/api/apps';

        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
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
            const res = await fetch(`/api/apps/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchApps(); // Refresh
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
            const res = await fetch('/api/activities/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                fetchApps(); // Refresh the app list to show updated activity
                // Auto-dismiss success after 2 seconds
                setTimeout(() => setRefreshResults(null), 2000);
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

    const activeApp = activeId ? apps.find(a => a.id === activeId) : null;

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleRefreshActivity} disabled={refreshingActivity} className="refresh-activity-btn" title="Refresh GitHub activity metrics">
                        {refreshingActivity ? '↻ Updating...' : '↻ Refresh Activity'}
                    </button>
                    <button onClick={onLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            {refreshResults && (
                <div style={{
                    marginBottom: '2rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: refreshResults.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${refreshResults.success ? '#22c55e' : '#ef4444'}`,
                    color: refreshResults.success ? '#86efac' : '#fca5a5'
                }}>
                    <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        {refreshResults.success ? '✓ Refresh completed' : '✗ Refresh failed'}
                    </div>
                    {refreshResults.success ? (
                        <pre style={{
                            margin: '0.5rem 0 0 0',
                            fontSize: '0.85rem',
                            overflow: 'auto',
                            background: 'rgba(15, 23, 42, 0.5)',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            color: '#86efac'
                        }}>
                            {JSON.stringify(refreshResults.data, null, 2)}
                        </pre>
                    ) : (
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            marginTop: '0.5rem',
                            color: '#fca5a5',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            {refreshResults.error}
                        </div>
                    )}
                    <button
                        onClick={() => setRefreshResults(null)}
                        style={{
                            marginTop: '0.75rem',
                            padding: '0.5rem 1rem',
                            background: 'transparent',
                            border: '1px solid currentColor',
                            borderRadius: '4px',
                            color: 'inherit',
                            cursor: 'pointer'
                        }}
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
                <div className="project-grid">
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
                        <div style={{ transform: 'scale(1.05)', cursor: 'grabbing' }}>
                            <ProjectCard project={activeApp} isAdmin={true} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Floating Add Button */}
            <button className="add-fab" onClick={openAddModal} title="Add New App">
                +
            </button>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="App Editor"
                className="ReactModal__Content"
                overlayClassName="ReactModal__Overlay"
            >
                <div className="modal-header">
                    <h2>{editingId ? 'Edit App' : 'Add New App'}</h2>
                    <button onClick={closeModal} className="close-btn">×</button>
                </div>

                <form onSubmit={handleSave} className="modal-body">
                    <div className="modal-form-section">
                        <div className="form-group">
                            <label>App Name</label>
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
                                style={{ width: '100%', background: '#0f172a', color: 'white', padding: '0.75rem', border: '1px solid #334155', borderRadius: '6px' }}
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
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    required
                                />
                                <button type="button" onClick={handleFetchOg} disabled={fetchingOg} className="action-btn">
                                    {fetchingOg ? '...' : 'Fetch OG'}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>GitHub Repo <span style={{ fontSize: '0.85em', color: '#94a3b8' }}>(owner/repo)</span></label>
                            <input
                                value={formData.github_repo}
                                onChange={e => {
                                    let val = e.target.value.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '');
                                    setFormData({ ...formData, github_repo: val });
                                }}
                                placeholder="e.g., darmitage/news-check"
                            />
                        </div>

                        {/* Platform Configuration Section */}
                        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#cbd5e1' }}>Platform Availability</h3>

                            {/* PWA Section */}
                            <div className="platform-section">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.pwa_available}
                                        onChange={e => setFormData({ ...formData, pwa_available: e.target.checked })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span>🌐 Progressive Web App (PWA)</span>
                                </label>
                            </div>

                            {/* iOS Section */}
                            <div className="platform-section">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.ios_available}
                                        onChange={e => setFormData({ ...formData, ios_available: e.target.checked })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span>📱 iOS App</span>
                                </label>
                                {formData.ios_available && (
                                    <div style={{ marginTop: '0.75rem', marginLeft: '1.5rem' }}>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ fontSize: '0.9em', color: '#cbd5e1' }}>Distribution Type:</label>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                                {['app_store', 'testflight', 'custom'].map(type => (
                                                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                                        <input
                                                            type="radio"
                                                            value={type}
                                                            checked={formData.ios_link_type === type}
                                                            onChange={e => setFormData({ ...formData, ios_link_type: e.target.value })}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                        <span style={{ fontSize: '0.9em' }}>
                                                            {type === 'app_store' ? 'App Store' : type === 'testflight' ? 'TestFlight' : 'Custom URL'}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <input
                                            type="url"
                                            placeholder={`Enter iOS ${formData.ios_link_type === 'app_store' ? 'App Store' : formData.ios_link_type === 'testflight' ? 'TestFlight' : 'app'} link`}
                                            value={formData.ios_link}
                                            onChange={e => setFormData({ ...formData, ios_link: e.target.value })}
                                            style={{ width: '100%', marginTop: '0.5rem', background: '#0f172a', color: 'white', padding: '0.5rem', border: '1px solid #334155', borderRadius: '4px' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* macOS Section */}
                            <div className="platform-section">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.macos_available}
                                        onChange={e => setFormData({ ...formData, macos_available: e.target.checked })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span>💻 macOS App</span>
                                </label>
                                {formData.macos_available && (
                                    <div style={{ marginTop: '0.75rem', marginLeft: '1.5rem' }}>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ fontSize: '0.9em', color: '#cbd5e1' }}>Distribution Type:</label>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                                {['app_store', 'testflight', 'dmg', 'custom'].map(type => (
                                                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                                        <input
                                                            type="radio"
                                                            value={type}
                                                            checked={formData.macos_link_type === type}
                                                            onChange={e => setFormData({ ...formData, macos_link_type: e.target.value })}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                        <span style={{ fontSize: '0.9em' }}>
                                                            {type === 'app_store' ? 'App Store' : type === 'testflight' ? 'TestFlight' : type === 'dmg' ? 'DMG' : 'Custom URL'}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <input
                                            type="url"
                                            placeholder={`Enter macOS ${formData.macos_link_type === 'app_store' ? 'App Store' : formData.macos_link_type === 'testflight' ? 'TestFlight' : formData.macos_link_type === 'dmg' ? 'DMG' : 'app'} link`}
                                            value={formData.macos_link}
                                            onChange={e => setFormData({ ...formData, macos_link: e.target.value })}
                                            style={{ width: '100%', marginTop: '0.5rem', background: '#0f172a', color: 'white', padding: '0.5rem', border: '1px solid #334155', borderRadius: '4px' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-preview-section">
                        <div className="preview-label">Live Preview</div>
                        <div style={{ width: '100%', maxWidth: '320px' }}>
                            <ProjectCard
                                project={{
                                    ...formData,
                                    id: 'preview',
                                    image_url: formData.image_url || 'https://placehold.co/300x180?text=Preview'
                                }}
                                isAdmin={false} // Show as it would look to user (no edit/delete buttons)
                            />
                        </div>
                    </div>
                </form>

                <div className="modal-footer">
                    <button type="button" onClick={closeModal} className="cancel-btn" style={{ flex: '0 0 auto', width: 'auto' }}>Cancel</button>
                    <button type="button" onClick={handleSave} className="admin-btn" style={{ flex: '0 0 auto', width: 'auto' }}>
                        {editingId ? 'Update App' : 'Create App'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
