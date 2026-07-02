'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatAmount, toNumber } from '@/lib/formatters';

export default function AdminOrderDetail({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const id = params.id;
    const router = useRouter();

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('PENDING');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (id) {
            fetchOrderDetail();
        }
    }, [id]);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, { credentials: 'include' });
            if (res.status === 404) {
                router.push('/admin/orders');
                return;
            }
            const data = await res.json();
            if (data.success) {
                setOrder(data.order);
                setItems(data.items || []);
                setStatus(data.order.status);
            }
        } catch (err) {
            console.error('Error loading order details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        setUpdatingStatus(true);

        try {
            const res = await fetch(`/api/admin/orders/${id}/status`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || 'Order status updated successfully!');
                fetchOrderDetail();
            } else {
                alert(data.message || 'Failed to update order status.');
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Connection error. Try again.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const s = status.toLowerCase();
        if (s === 'pending') return 'status-badge pending';
        if (s === 'confirmed') return 'status-badge confirmed';
        if (s === 'packed') return 'status-badge confirmed';
        if (s === 'shipped') return 'status-badge shipped';
        if (s === 'delivered') return 'status-badge delivered';
        return 'status-badge cancelled';
    };

    if (loading && !order) {
        return <div style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Loading order details...</div>;
    }

    if (!order) return null;

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <Link href="/admin/orders" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: '8px' }}>
                        ← Back to Orders List
                    </Link>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', margin: 0 }}>
                        Manage Order #{order.id}
                    </h2>
                </div>
                <span className={getStatusBadgeClass(order.status)} style={{ fontSize: '14px', padding: '8px 16px' }}>
                    {order.status.toUpperCase()}
                </span>
            </div>

            {/* 2 Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' }}>
                
                {/* LEFT COLUMN: ITEMS & ADDRESS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* 1. ORDER ITEMS */}
                    <div className="admin-card">
                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
                            Ordered Items
                        </h3>
                        <div>
                            {items.map(item => (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <img 
                                        src={item.main_image} 
                                        alt={item.name} 
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--admin-border)' }} 
                                    />
                                    <div style={{ flexGrow: 1 }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-white)', fontSize: '14px' }}>{item.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-gray)', marginTop: '4px' }}>
                                            SKU: {item.sku} &bull; Brand: {item.brand} &bull; Price: ₹{formatAmount(item.price)}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-gray)', width: '60px', textAlign: 'center' }}>
                                        Qty: <span style={{ fontWeight: '700', color: 'var(--text-white)' }}>{item.quantity}</span>
                                    </div>
                                    <div style={{ fontWeight: '700', color: 'var(--text-white)', width: '100px', textAlign: 'right' }}>
                                        ₹{formatAmount(item.total)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. SHIPPING DETAILS */}
                    <div className="admin-card">
                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
                            Shipping & Contact Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px' }}>
                            <div>
                                <div style={{ color: 'var(--text-gray)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Recipient Name</div>
                                <div style={{ fontWeight: '700', color: 'var(--text-white)' }}>{order.recipient_name}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-gray)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>WhatsApp Number</div>
                                <div style={{ fontWeight: '700', color: 'var(--text-white)' }}>+91 {order.phone}</div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <div style={{ color: 'var(--text-gray)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Street Address</div>
                                <div style={{ fontWeight: '600', color: 'var(--text-white)' }}>{order.address_line}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-gray)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>City & State</div>
                                <div style={{ fontWeight: '600', color: 'var(--text-white)' }}>{order.city}, {order.state}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-gray)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Pincode</div>
                                <div style={{ fontWeight: '700', color: 'var(--text-white)' }}>{order.pincode}</div>
                            </div>

                            {order.latitude && order.longitude && (
                                <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--admin-border)', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ color: 'var(--text-gray)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Farm GPS Coordinates</div>
                                        <div style={{ color: 'var(--text-white)', fontFamily: 'monospace', fontWeight: '600' }}>
                                            {parseFloat(order.latitude).toFixed(5)}, {parseFloat(order.longitude).toFixed(5)}
                                        </div>
                                    </div>
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="admin-btn admin-btn-secondary"
                                        style={{ padding: '8px 16px', fontSize: '12px', textDecoration: 'none' }}
                                    >
                                        🗺️ Open in Google Maps
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: FULFILLMENT STATUS FORM & INVOICE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* FULFILLMENT STATUS FORM */}
                    <div className="admin-card">
                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
                            Fulfillment Control
                        </h3>
                        <form onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label>Change Order Status</label>
                                <select 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)} 
                                    className="form-control"
                                    style={{ background: 'rgba(0,0,0,0.2)' }}
                                >
                                    <option value="PENDING">Pending Confirmation</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PACKED">Packed</option>
                                    <option value="SHIPPED">Shipped / Dispatched</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', padding: '12px 0' }} disabled={updatingStatus}>
                                    {updatingStatus ? '⏳ Updating...' : '💾 Save Status Update'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* BILLING INVOICE */}
                    <div className="admin-card">
                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
                            Invoice Summary
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-gray)' }}>Subtotal</span>
                                <span style={{ fontWeight: '600', color: 'var(--text-white)' }}>₹{formatAmount(order.subtotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-gray)' }}>Platform Fee</span>
                                <span style={{ fontWeight: '600', color: 'var(--accent)' }}>
                                    {toNumber(order.platform_fee) > 0 ? `₹${formatAmount(order.platform_fee)}` : 'Free'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--admin-border)', paddingTop: '12px', fontWeight: 'bold' }}>
                                <span style={{ color: 'var(--text-white)' }}>Grand Total</span>
                                <span style={{ color: 'var(--accent)', fontSize: '18px' }}>₹{formatAmount(order.total)}</span>
                            </div>
                        </div>
                    </div>
                    
                </div>

            </div>
        </div>
    );
}
