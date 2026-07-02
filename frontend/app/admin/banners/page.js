'use client';

import React, { useEffect, useState } from 'react';

const emptyForm = {
    title: '',
    subtitle: '',
    linkUrl: '',
    displayOrder: 0,
    isActive: true,
    imageFile: null
};

export default function AdminBanners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/banners', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setBanners(data.banners || []);
            }
        } catch (err) {
            console.error('Error loading banners:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setEditingBanner(null);
        setForm(emptyForm);
    };

    const startEdit = (banner) => {
        setEditingBanner(banner);
        setForm({
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            linkUrl: banner.link_url || '',
            displayOrder: banner.display_order ?? 0,
            isActive: Boolean(Number(banner.is_active)),
            imageFile: null
        });
    };

    const handleDelete = async (bannerId) => {
        if (!confirm('Delete this homepage banner?')) return;

        try {
            const res = await fetch(`/api/admin/banners/delete/${bannerId}`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                if (editingBanner?.id === bannerId) resetForm();
                await loadBanners();
            } else {
                alert(data.message || 'Failed to delete banner.');
            }
        } catch (err) {
            console.error('Error deleting banner:', err);
            alert('Connection error. Try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('subtitle', form.subtitle);
        formData.append('link_url', form.linkUrl);
        formData.append('display_order', form.displayOrder);
        formData.append('is_active', form.isActive ? '1' : '0');
        if (form.imageFile) {
            formData.append('image', form.imageFile);
        }

        const endpoint = editingBanner
            ? `/api/admin/banners/edit/${editingBanner.id}`
            : '/api/admin/banners/add';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                resetForm();
                await loadBanners();
            } else {
                alert(data.message || 'Failed to save banner.');
            }
        } catch (err) {
            console.error('Error saving banner:', err);
            alert('Connection error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && banners.length === 0) {
        return <div style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Loading banners...</div>;
    }

    return (
        <div className="admin-feature-grid">
            <div className="admin-card">
                <h2 className="admin-section-heading">Active Carousel Banners</h2>
                {banners.length === 0 ? (
                    <p className="admin-empty-text">No banners created yet. The homepage will display the default slide.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Banner Preview</th>
                                    <th>Title / Subtitle</th>
                                    <th>Redirection Link</th>
                                    <th>Order</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banners.map((banner) => (
                                    <tr key={banner.id}>
                                        <td style={{ width: '120px' }}>
                                            <img
                                                src={banner.image_url}
                                                alt={banner.title}
                                                className="admin-thumb admin-thumb-banner"
                                            />
                                        </td>
                                        <td>
                                            <div className="admin-row-title">{banner.title}</div>
                                            <div className="admin-row-subtitle">{banner.subtitle || 'No subtitle'}</div>
                                        </td>
                                        <td className="admin-link-cell">{banner.link_url || '/shop'}</td>
                                        <td style={{ fontWeight: 700 }}>{banner.display_order ?? 0}</td>
                                        <td>
                                            <span className={Number(banner.is_active) ? 'admin-status-pill active' : 'admin-status-pill inactive'}>
                                                {Number(banner.is_active) ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            <button type="button" onClick={() => startEdit(banner)} className="admin-btn admin-btn-secondary admin-btn-compact">
                                                Edit
                                            </button>
                                            <button type="button" onClick={() => handleDelete(banner.id)} className="admin-btn admin-btn-danger admin-btn-compact">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="admin-card">
                <div className="admin-form-title-row">
                    <h2 className="admin-section-heading">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
                    {editingBanner && (
                        <button type="button" className="admin-link-button" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="admin-side-form">
                    <div className="form-group">
                        <label>Banner Heading / Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => updateForm('title', e.target.value)}
                            required
                            className="form-control"
                            placeholder="High-Tensile Rotavator Parts"
                        />
                    </div>
                    <div className="form-group">
                        <label>Subheading / Description</label>
                        <textarea
                            rows="3"
                            value={form.subtitle}
                            onChange={(e) => updateForm('subtitle', e.target.value)}
                            className="form-control"
                            placeholder="Engineered for heavy-duty field operations."
                        />
                    </div>
                    <div className="form-group">
                        <label>Action Redirection Link (URL)</label>
                        <input
                            type="text"
                            value={form.linkUrl}
                            onChange={(e) => updateForm('linkUrl', e.target.value)}
                            className="form-control"
                            placeholder="/shop?category=rotavator-yoke"
                        />
                    </div>
                    <div className="admin-inline-fields">
                        <div className="form-group">
                            <label>Display Order Sequence *</label>
                            <input
                                type="number"
                                min="0"
                                value={form.displayOrder}
                                onChange={(e) => updateForm('displayOrder', e.target.value)}
                                required
                                className="form-control"
                            />
                        </div>
                        <label className="admin-check-field">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => updateForm('isActive', e.target.checked)}
                            />
                            <span>Active & Published</span>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Banner Graphic Image {editingBanner ? '' : '*'}</label>
                        <input
                            type="file"
                            onChange={(e) => updateForm('imageFile', e.target.files[0] || null)}
                            required={!editingBanner}
                            className="form-control"
                            accept="image/*"
                        />
                        {editingBanner && <small className="admin-field-note">Leave empty to keep the current image.</small>}
                    </div>
                    <button type="submit" className="admin-btn admin-btn-primary admin-submit-btn" disabled={submitting}>
                        {submitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Upload Banner'}
                    </button>
                </form>
            </div>
        </div>
    );
}
