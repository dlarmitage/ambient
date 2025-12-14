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
import SortableProductCard from './components/SortableProductCard';
import ProductCard from './components/ProductCard';
import './Admin.css';
import './ProductShowcase.css';

Modal.setAppElement('#root');

const AdminDashboard = ({ token, onLogout }) => {
    const [apps, setApps] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        link: '',
        image_url: ''
    });
    const [fetchingOg, setFetchingOg] = useState(false);
    const [activeId, setActiveId] = useState(null); // ID of item being dragged

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
            const res = await fetch('http://localhost:3001/api/apps');
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
                await fetch('http://localhost:3001/api/apps/reorder', {
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
        setFormData({ name: '', description: '', link: '', image_url: '' });
        setModalIsOpen(true);
    };

    const openEditModal = (app) => {
        setEditingId(app.id);
        setFormData({
            name: app.name,
            description: app.description,
            link: app.link,
            image_url: app.image_url
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
            const res = await fetch(`http://localhost:3001/api/fetch-og?url=${encodeURIComponent(formData.link)}`);
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
            ? `http://localhost:3001/api/apps/${editingId}`
            : 'http://localhost:3001/api/apps';

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
            const res = await fetch(`http://localhost:3001/api/apps/${id}`, {
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

    const activeApp = activeId ? apps.find(a => a.id === activeId) : null;

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <button onClick={onLogout} className="logout-btn">Logout</button>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="product-grid">
                    <SortableContext
                        items={apps.map(a => a.id)}
                        strategy={rectSortingStrategy}
                    >
                        {apps.map(app => (
                            <SortableProductCard
                                key={app.id}
                                product={app}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        ))}
                    </SortableContext>
                </div>

                <DragOverlay>
                    {activeApp ? (
                        <div style={{ transform: 'scale(1.05)', cursor: 'grabbing' }}>
                            <ProductCard product={activeApp} isAdmin={true} />
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
                    </div>

                    <div className="modal-preview-section">
                        <div className="preview-label">Live Preview</div>
                        <div style={{ width: '100%', maxWidth: '320px' }}>
                            <ProductCard
                                product={{
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
