'use client';

import React, { useEffect, useState } from 'react';

const emptyForm = {
    name: '',
    description: '',
    imageFile: null
};

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setCategories(data.categories || []);
            }
        } catch (err) {
            console.error('Error loading categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setEditingCategory(null);
        setForm(emptyForm);
    };

    const startEdit = (category) => {
        setEditingCategory(category);
        setForm({
            name: category.name || '',
            description: category.description || '',
            imageFile: null
        });
    };

    const handleDelete = async (categoryId) => {
        if (!confirm('Delete this category division? Products inside this category may also be removed by database rules.')) return;

        try {
            const res = await fetch(`/api/admin/categories/delete/${categoryId}`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                if (editingCategory?.id === categoryId) resetForm();
                await loadCategories();
            } else {
                alert(data.message || 'Failed to delete category.');
            }
        } catch (err) {
            console.error('Error deleting category:', err);
            alert('Connection error. Try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        if (form.imageFile) {
            formData.append('image', form.imageFile);
        }

        const endpoint = editingCategory
            ? `/api/admin/categories/edit/${editingCategory.id}`
            : '/api/admin/categories/add';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                resetForm();
                await loadCategories();
            } else {
                alert(data.message || 'Failed to save category.');
            }
        } catch (err) {
            console.error('Error saving category:', err);
            alert('Connection error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && categories.length === 0) {
        return <div style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Loading categories catalog...</div>;
    }

    return (
        <div className="admin-feature-grid">
            <div className="admin-card">
                <h2 className="admin-section-heading">Active Categories</h2>
                {categories.length === 0 ? (
                    <p className="admin-empty-text">No categories found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Icon</th>
                                    <th>Category Name</th>
                                    <th>Slug</th>
                                    <th>Description</th>
                                    <th>Catalog Size</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td style={{ width: '70px' }}>
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="admin-thumb admin-thumb-category"
                                            />
                                        </td>
                                        <td>
                                            <div className="admin-row-title admin-row-title-accent">{category.name}</div>
                                        </td>
                                        <td className="admin-mono-cell">{category.slug}</td>
                                        <td className="admin-truncate-cell">{category.description || '-'}</td>
                                        <td>
                                            <span className="admin-count-pill">
                                                <strong>{category.product_count || 0}</strong>
                                                <span>parts</span>
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            <button type="button" onClick={() => startEdit(category)} className="admin-btn admin-btn-secondary admin-btn-compact">
                                                Edit
                                            </button>
                                            <button type="button" onClick={() => handleDelete(category.id)} className="admin-btn admin-btn-danger admin-btn-compact">
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
                    <h2 className="admin-section-heading">{editingCategory ? 'Edit Division' : 'Add New Division'}</h2>
                    {editingCategory && (
                        <button type="button" className="admin-link-button" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="admin-side-form">
                    <div className="form-group">
                        <label>Category Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => updateForm('name', e.target.value)}
                            required
                            className="form-control"
                            placeholder="PTO Cross Kit"
                        />
                    </div>
                    <div className="form-group">
                        <label>Summary Description</label>
                        <textarea
                            rows="4"
                            value={form.description}
                            onChange={(e) => updateForm('description', e.target.value)}
                            className="form-control"
                            placeholder="Heavy duty replacement parts for standard power take-off couplers."
                        />
                    </div>
                    <div className="form-group">
                        <label>Division Icon / Image {editingCategory ? '' : '*'}</label>
                        <input
                            type="file"
                            onChange={(e) => updateForm('imageFile', e.target.files[0] || null)}
                            required={!editingCategory}
                            className="form-control"
                            accept="image/*"
                        />
                        {editingCategory && <small className="admin-field-note">Leave empty to keep the current image.</small>}
                    </div>
                    <button type="submit" className="admin-btn admin-btn-primary admin-submit-btn" disabled={submitting}>
                        {submitting ? 'Saving...' : editingCategory ? 'Update Category Division' : 'Save Category Division'}
                    </button>
                </form>
            </div>
        </div>
    );
}
