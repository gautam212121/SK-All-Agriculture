'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatAmount } from '@/lib/formatters';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/orders', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders || []);
            }
        } catch (err) {
            console.error('Error loading admin orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const s = status.toLowerCase();
        if (s === 'pending') return 'status-badge pending';
        if (s === 'confirmed') return 'status-badge confirmed';
        if (s === 'shipped') return 'status-badge shipped';
        if (s === 'delivered') return 'status-badge delivered';
        return 'status-badge cancelled';
    };

    if (loading && orders.length === 0) {
        return <div style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Loading orders...</div>;
    }

    return (
        <div className="admin-card">
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
                All Customer Orders
            </h2>
            {orders.length === 0 ? (
                <p style={{ color: 'var(--text-gray)', fontStyle: 'italic', fontSize: '14px', padding: '20px 0' }}>No orders found.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Mobile / WhatsApp</th>
                                <th>Date</th>
                                <th>Total Price</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-white)' }}>
                                        #{order.id}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{order.recipient_name}</td>
                                    <td>{order.phone}</td>
                                    <td>{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                    <td style={{ fontWeight: '600', color: 'var(--accent)' }}>
                                        ₹{formatAmount(order.total)}
                                    </td>
                                    <td>
                                        <span className={getStatusBadgeClass(order.status)}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <Link href={`/admin/orders/${order.id}`} className="admin-btn admin-btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none' }}>
                                            Manage Shipment ➔
                                        </Link>
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
