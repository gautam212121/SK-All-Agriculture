'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminProducts() {
    const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [currentProductId, setCurrentProductId] = useState(null);
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [brand, setBrand] = useState('');
    const [material, setMaterial] = useState('');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [stock, setStock] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [weight, setWeight] = useState('');
    const [compatibleModel, setCompatibleModel] = useState('');
    const [partUsage, setPartUsage] = useState('');
    const [qualityType, setQualityType] = useState('Premium Grade');
    const [warranty, setWarranty] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    
    // File upload states
    const [mainImageFile, setMainImageFile] = useState(null);
    const [extraImageFiles, setExtraImageFiles] = useState([]);
    const [existingMainImage, setExistingMainImage] = useState('');
    const [existingExtraImages, setExistingExtraImages] = useState([]);
    
    const [submitting, setSubmitting] = useState(false);

    // Fetch Products & Categories
    useEffect(() => {
        loadProductsAndCategories();
    }, []);

    const loadProductsAndCategories = async () => {
        setLoading(true);
        try {
            const prodRes = await fetch('/api/admin/products', { credentials: 'include' });
            const prodData = await prodRes.json();
            
            const catRes = await fetch('/api/admin/categories', { credentials: 'include' });
            const catData = await catRes.json();

            if (prodData.success) setProducts(prodData.products || []);
            if (catData.success) setCategories(catData.categories || []);
        } catch (err) {
            console.error('Error loading admin products data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Reset Form
    const resetForm = () => {
        setCurrentProductId(null);
        setName('');
        setSku('');
        setBrand('');
        setMaterial('');
        setPrice('');
        setDiscountPrice('');
        setStock('');
        setCategoryId('');
        setWeight('');
        setCompatibleModel('');
        setPartUsage('');
        setQualityType('Premium Grade');
        setWarranty('');
        setShortDescription('');
        setDescription('');
        setIsActive(true);
        setMainImageFile(null);
        setExtraImageFiles([]);
        setExistingMainImage('');
        setExistingExtraImages([]);
    };

    // Trigger Add View
    const handleAddClick = () => {
        resetForm();
        if (categories.length > 0) {
            setCategoryId(categories[0].id.toString());
        }
        setView('add');
    };

    // Trigger Edit View
    const handleEditClick = async (product) => {
        resetForm();
        setCurrentProductId(product.id);
        setName(product.name || '');
        setSku(product.sku || '');
        setBrand(product.brand || '');
        setMaterial(product.material || '');
        setPrice(product.price ? product.price.toString() : '');
        setDiscountPrice(product.discount_price ? product.discount_price.toString() : '');
        setStock(product.stock !== null && product.stock !== undefined ? product.stock.toString() : '');
        setCategoryId(product.category_id ? product.category_id.toString() : '');
        setWeight(product.weight || '');
        setCompatibleModel(product.compatible_model || '');
        setPartUsage(product.part_usage || '');
        setQualityType(product.quality_type || 'Premium Grade');
        setWarranty(product.warranty || '');
        setShortDescription(product.short_description || '');
        setDescription(product.description || '');
        setIsActive(product.is_active === undefined ? true : Boolean(Number(product.is_active)));
        setExistingMainImage(product.main_image || '');

        // Fetch extra images
        try {
            const res = await fetch(`/api/admin/products/edit/${product.id}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.extraImages) {
                setExistingExtraImages(data.extraImages);
            }
        } catch (err) {
            console.error('Error fetching extra images:', err);
        }

        setView('edit');
    };

    // Handle Delete Product
    const handleDeleteClick = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`/api/admin/products/delete/${productId}`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || 'Product deleted.');
                loadProductsAndCategories();
            } else {
                alert(data.message || 'Failed to delete product.');
            }
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    // Handle Delete Extra Image
    const handleDeleteImage = async (imageId) => {
        if (!confirm('Delete this gallery image?')) return;
        try {
            const res = await fetch(`/api/admin/products/delete-image/${imageId}`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setExistingExtraImages(prev => prev.filter(img => img.id !== imageId));
            } else {
                alert(data.message || 'Failed to delete image.');
            }
        } catch (err) {
            console.error('Error deleting extra image:', err);
        }
    };

    // Handle Submit Form (Add or Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('sku', sku);
        formData.append('brand', brand);
        formData.append('material', material);
        formData.append('price', price);
        formData.append('discount_price', discountPrice);
        formData.append('stock', stock);
        formData.append('category_id', categoryId);
        formData.append('weight', weight);
        formData.append('compatible_model', compatibleModel);
        formData.append('part_usage', partUsage);
        formData.append('quality_type', qualityType);
        formData.append('warranty', warranty);
        formData.append('short_description', shortDescription);
        formData.append('description', description);
        formData.append('is_active', isActive ? '1' : '0');

        if (mainImageFile) {
            formData.append('main_image', mainImageFile);
        }

        for (let i = 0; i < extraImageFiles.length; i++) {
            formData.append('extra_images', extraImageFiles[i]);
        }

        const url = view === 'add' 
            ? '/api/admin/products/add' 
            : `/api/admin/products/edit/${currentProductId}`;

        try {
            const res = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || 'Product saved successfully!');
                setView('list');
                loadProductsAndCategories();
            } else {
                alert(data.message || 'Failed to save product.');
            }
        } catch (err) {
            console.error('Error saving product:', err);
            alert('Connection error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && products.length === 0) {
        return <div style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Loading products catalog...</div>;
    }

    return (
        <div>
            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', margin: 0 }}>
                    {view === 'list' ? 'Product Inventory List' : view === 'add' ? 'Add New Spare Part' : 'Edit Spare Part Details'}
                </h2>
                {view === 'list' ? (
                    <button onClick={handleAddClick} className="admin-btn admin-btn-primary">
                        ➕ Add New Product
                    </button>
                ) : (
                    <button onClick={() => setView('list')} className="admin-btn admin-btn-secondary">
                        ← Back to List
                    </button>
                )}
            </div>

            {/* LIST VIEW */}
            {view === 'list' && (
                <div className="admin-card">
                    {products.length === 0 ? (
                        <p style={{ color: 'var(--text-gray)', fontStyle: 'italic', fontSize: '14px', padding: '20px 0' }}>No products found.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>SKU</th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(prod => (
                                        <tr key={prod.id}>
                                            <td style={{ width: '60px' }}>
                                                <img 
                                                    src={prod.main_image} 
                                                    alt={prod.name} 
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--admin-border)' }} 
                                                />
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{prod.sku}</td>
                                            <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>{prod.name}</td>
                                            <td style={{ fontSize: '13px' }}>{prod.category_name}</td>
                                            <td style={{ fontWeight: '600', color: 'var(--accent)' }}>
                                                {prod.discount_price ? (
                                                    <>
                                                        <span style={{ marginRight: '8px' }}>₹{prod.discount_price}</span>
                                                        <span style={{ textDecoration: 'line-through', color: 'var(--text-gray)', fontSize: '12px' }}>₹{prod.price}</span>
                                                    </>
                                                ) : `₹${prod.price}`}
                                            </td>
                                            <td>
                                                {prod.stock > 0 ? (
                                                    <span className="status-badge delivered" style={{ fontSize: '11px', padding: '2px 6px' }}>{prod.stock} Units</span>
                                                ) : (
                                                    <span className="status-badge cancelled" style={{ fontSize: '11px', padding: '2px 6px' }}>Out of Stock</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleEditClick(prod)} className="admin-btn admin-btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                                                        ✏️ Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(prod.id)} className="admin-btn admin-btn-danger" style={{ padding: '4px 10px', fontSize: '11px' }}>
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ADD / EDIT FORM VIEW */}
            {(view === 'add' || view === 'edit') && (
                <div className="admin-card">
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Name */}
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Product Title / Name *</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="form-control" placeholder="Rotavator Forged Yoke 30mm" />
                        </div>

                        {/* SKU & Brand */}
                        <div className="form-group">
                            <label>SKU Code *</label>
                            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} required className="form-control" placeholder="SK-YOKE-001" />
                        </div>
                        <div className="form-group">
                            <label>Manufacturer Brand *</label>
                            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required className="form-control" placeholder="SK Agriculture Parts" />
                        </div>

                        {/* Category & Material */}
                        <div className="form-group">
                            <label>Category *</label>
                            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="form-control">
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Forged Material / Steel Grade *</label>
                            <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} required className="form-control" placeholder="EN8 Alloy Steel / Forged Steel" />
                        </div>

                        {/* Price, Discount Price, Stock */}
                        <div className="form-group">
                            <label>Standard Price (₹) *</label>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="form-control" placeholder="1200" />
                        </div>
                        <div className="form-group">
                            <label>Discounted Price (₹) (Optional)</label>
                            <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="form-control" placeholder="999" />
                        </div>
                        <div className="form-group">
                            <label>Warehouse Stock Level *</label>
                            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="form-control" placeholder="25" />
                        </div>
                        <label className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '28px' }}>
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontWeight: 600 }}>Published on user storefront</span>
                        </label>

                        {/* Technical specifications */}
                        <div className="form-group">
                            <label>Net Weight (kg) *</label>
                            <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} required className="form-control" placeholder="2.8 kg" />
                        </div>
                        <div className="form-group">
                            <label>Compatible Machinery Model *</label>
                            <input type="text" value={compatibleModel} onChange={(e) => setCompatibleModel(e.target.value)} required className="form-control" placeholder="Swaraj 744, Swaraj 855" />
                        </div>
                        <div className="form-group">
                            <label>Part Usage / Application *</label>
                            <input type="text" value={partUsage} onChange={(e) => setPartUsage(e.target.value)} required className="form-control" placeholder="PTO shaft connection / Rotavator gearbox" />
                        </div>
                        <div className="form-group">
                            <label>Quality Grade Purity *</label>
                            <input type="text" value={qualityType} onChange={(e) => setQualityType(e.target.value)} required className="form-control" placeholder="Premium Grade" />
                        </div>
                        <div className="form-group">
                            <label>Manufacturer Warranty</label>
                            <input type="text" value={warranty} onChange={(e) => setWarranty(e.target.value)} className="form-control" placeholder="1 Year Warranty" />
                        </div>

                        {/* Short Description */}
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Short Description (1-2 sentences) *</label>
                            <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required className="form-control" placeholder="Heavy-duty forged steel yoke for Swaraj rotavator models." />
                        </div>

                        {/* Detailed Description */}
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Detailed Specifications / Description</label>
                            <textarea rows="5" value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" placeholder="Enter detailed specifications..."></textarea>
                        </div>

                        {/* Main Image Upload */}
                        <div className="form-group" style={{ gridColumn: view === 'edit' ? '1' : 'span 2' }}>
                            <label>Main Product Image {view === 'add' ? '*' : '(Leave empty to keep current)'}</label>
                            <input type="file" onChange={(e) => setMainImageFile(e.target.files[0])} required={view === 'add'} className="form-control" accept="image/*" />
                        </div>

                        {/* Existing Main Image Preview (Edit Mode Only) */}
                        {view === 'edit' && existingMainImage && (
                            <div className="form-group">
                                <label>Current Main Image</label>
                                <div style={{ marginTop: '5px' }}>
                                    <img src={existingMainImage} alt="Current View" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--admin-border)' }} />
                                </div>
                            </div>
                        )}

                        {/* Extra Images Upload */}
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Upload Gallery Images (Select Multiple)</label>
                            <input type="file" multiple onChange={(e) => setExtraImageFiles(e.target.files)} className="form-control" accept="image/*" />
                        </div>

                        {/* Existing Extra Images Preview (Edit Mode Only) */}
                        {view === 'edit' && existingExtraImages.length > 0 && (
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Product Gallery Images</label>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    {existingExtraImages.map(img => (
                                        <div key={img.id} style={{ position: 'relative', display: 'inline-block' }}>
                                            <img src={img.image_url} alt="Gallery view" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--admin-border)' }} />
                                            <button 
                                                type="button" 
                                                onClick={() => handleDeleteImage(img.id)}
                                                style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit Row */}
                        <div className="form-group" style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                            <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', padding: '14px 0' }} disabled={submitting}>
                                {submitting ? '⏳ Saving Product...' : '💾 Save Spare Part Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
