'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatAmount, toNumber } from '@/lib/formatters';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
                const data = await res.json();
                if (data.success) {
                    const dashboardStats = data.stats || data.analytics || {};
                    setStats({
                        totalRevenue: toNumber(dashboardStats.totalRevenue ?? dashboardStats.totalSales),
                        totalOrders: dashboardStats.totalOrders || 0,
                        totalProducts: dashboardStats.totalProducts || 0,
                        totalUsers: dashboardStats.totalUsers || 0
                    });
                    setRecentOrders(data.recentOrders || []);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    const getStatusBadgeClass = (status) => {
        const s = status.toLowerCase();
        if (s === 'pending') return 'status-badge pending';
        if (s === 'confirmed') return 'status-badge confirmed';
        if (s === 'shipped') return 'status-badge shipped';
        if (s === 'delivered') return 'status-badge delivered';
        return 'status-badge cancelled';
    };

    if (loading) {
        return <div style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Loading dashboard metrics...</div>;
    }

    return (
        <div>
            {/* Stats Cards Grid */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">💰</div>
                    <div className="admin-stat-info">
                        <h3 className="admin-stat-label">Total Revenue</h3>
                        <p className="admin-stat-value" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            ₹{toNumber(stats.totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
                
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">📦</div>
                    <div className="admin-stat-info">
                        <h3 className="admin-stat-label">Total Orders</h3>
                        <p className="admin-stat-value">{stats.totalOrders}</p>
                    </div>
                </div>
                
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">🚜</div>
                    <div className="admin-stat-info">
                        <h3 className="admin-stat-label">Products Listed</h3>
                        <p className="admin-stat-value">{stats.totalProducts}</p>
                    </div>
                </div>
                
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">👥</div>
                    <div className="admin-stat-info">
                        <h3 className="admin-stat-label">Active Customers</h3>
                        <p className="admin-stat-value">{stats.totalUsers}</p>
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="admin-card" style={{ marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border)', paddingBottom: '16px', marginBottom: '20px' }}>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', margin: 0 }}>Recent Order Shipments</h2>
                    <Link href="/admin/orders" className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}>
                        View All Orders
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <p style={{ color: 'var(--text-gray)', fontStyle: 'italic', fontSize: '14px', padding: '20px 0' }}>
                        No orders recorded yet.
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Date</th>
                                    <th>Total Price</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-white)' }}>
                                            #{order.id}
                                        </td>
                                        <td>{order.recipient_name}</td>
                                        <td>{order.phone}</td>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
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
                                                Manage ➔
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
