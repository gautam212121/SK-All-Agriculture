'use client';

import React, { useState, useEffect } from 'react';

export default function AdminInventory() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Local stock edit state (keyed by product ID)
    const [stockEdits, setStockEdits] = useState({});
    const [updatingMap, setUpdatingMap] = useState({});

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/inventory', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setProducts(data.products || []);
                // Initialize stock edits
                const edits = {};
                data.products.forEach(p => {
                    edits[p.id] = p.stock;
                });
                setStockEdits(edits);
            }
        } catch (err) {
            console.error('Error loading inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStockChange = (productId, val) => {
        setStockEdits(prev => ({
            ...prev,
            [productId]: Math.max(0, parseInt(val) || 0)
        }));
    };

    const handleSaveStock = async (productId) => {
        const newStock = stockEdits[productId];
        setUpdatingMap(prev => ({ ...prev, [productId]: true }));

        try {
            const res = await fetch('/api/admin/inventory/update', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: productId, stock: newStock })
            });
            const data = await res.json();
            if (data.success) {
                // Success feedback
                alert(data.message || 'Stock level updated.');
                // Update local products list
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
            } else {
                alert(data.message || 'Failed to update stock.');
            }
        } catch (err) {
            console.error('Error saving stock:', err);
            alert('Connection error. Try again.');
        } finally {
            setUpdatingMap(prev => ({ ...prev, [productId]: false }));
        }
    };

    if (loading && products.length === 0) {
        return <div style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Loading warehouse inventory...</div>;
    }

    return (
        <div className="admin-card">
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
                Warehouse Stock Inventory
            </h2>
            {products.length === 0 ? (
                <p style={{ color: 'var(--text-gray)', fontStyle: 'italic', fontSize: '14px', padding: '20px 0' }}>No products found in catalog.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>SKU Code</th>
                                <th>Product Name</th>
                                <th>Brand</th>
                                <th>Current Stock</th>
                                <th style={{ width: '240px', textAlign: 'right' }}>Update Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(prod => (
                                <tr key={prod.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-white)' }}>
                                        {prod.sku}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{prod.name}</td>
                                    <td>{prod.brand}</td>
                                    <td>
                                        {prod.stock > 0 ? (
                                            <span className="status-badge delivered" style={{ fontSize: '11px', padding: '2px 6px' }}>
                                                {prod.stock} Units
                                            </span>
                                        ) : (
                                            <span className="status-badge cancelled" style={{ fontSize: '11px', padding: '2px 6px' }}>
                                                Out of Stock
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <input 
                                                type="number" 
                                                value={stockEdits[prod.id] !== undefined ? stockEdits[prod.id] : prod.stock}
                                                onChange={(e) => handleStockChange(prod.id, e.target.value)}
                                                min="0"
                                                className="form-control"
                                                style={{ width: '80px', padding: '6px 12px', background: 'rgba(0,0,0,0.2)', marginBottom: 0, textAlign: 'center' }}
                                            />
                                            <button 
                                                onClick={() => handleSaveStock(prod.id)}
                                                className="admin-btn admin-btn-primary" 
                                                style={{ padding: '6px 14px', fontSize: '12px' }}
                                                disabled={updatingMap[prod.id]}
                                            >
                                                {updatingMap[prod.id] ? '⏳ Saving...' : '💾 Save'}
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
    );
}
