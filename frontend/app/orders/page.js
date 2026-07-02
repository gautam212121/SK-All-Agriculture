'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useApp } from '../../context/AppContext';

export default function Orders() {
    const { user, loading: authLoading } = useApp();
    const router = useRouter();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirectTo=/orders');
            return;
        }

        if (user) {
            fetchOrders();
        }
    }, [user, authLoading, router]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders || []);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
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

    if (authLoading || loading) {
        return (
            <>
                <Header />
                <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <h3>Loading order history...</h3>
                </div>
                <Footer />
            </>
        );
    }

    if (!user) return null;

    return (
        <>
            <Header />

            <section className="section-padding" id="profile-container" style={{ minHeight: '80vh' }}>
                <div className="container">
                    <div className="checkout-layout" style={{ gridTemplateColumns: '280px 1fr', alignItems: 'start', gap: '30px' }}>
                        
                        {/* Account Sidebar Navigation */}
                        <div className="checkout-summary-card" style={{ padding: '24px', position: 'sticky', top: '100px', background: 'var(--bg-surface)' }}>
                            {/* Sidebar Bio Card */}
                            <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px', marginBottom: '20px' }}>
                                <div className="profile-user-avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--accent-gold)', color: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifycontent: 'center', fontSize: '28px', fontWeight: '700', margin: '0 auto 12px auto', fontFamily: "'Outfit', sans-serif" }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', color: 'var(--text-light)', marginBottom: '4px' }}>
                                    {user.name}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user.email}</p>
                            </div>

                            {/* Navigation Links */}
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <li>
                                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>
                                        👤 Profile & Addresses
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--accent-gold)', background: 'rgba(212, 175, 55, 0.05)', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
                                        🚜 Order History
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>
                                        🛒 View Active Cart
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Main Content Area */}
                        <div className="checkout-form-card" style={{ padding: '30px', background: 'var(--bg-surface)' }}>
                            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', color: 'var(--text-light)', marginBottom: '6px' }}>
                                Your Order History
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
                                Review and track all your Cash on Delivery spare parts orders.
                            </p>

                            {orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                    <span style={{ fontSize: '48px' }}>🚜</span>
                                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginTop: '16px', marginBottom: '8px' }}>No Orders Placed Yet</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '360px', margin: '0 auto 20px auto' }}>
                                        You haven&apos;t placed any orders with us yet. Visit the catalog to find the parts you need.
                                    </p>
                                    <Link href="/shop" className="btn-accent" style={{ display: 'inline-block', padding: '10px 24px' }}>
                                        Browse Spare Parts
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="admin-table" style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                                                <th style={{ padding: '12px 16px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Order ID</th>
                                                <th style={{ padding: '12px 16px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</th>
                                                <th style={{ padding: '12px 16px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Items</th>
                                                <th style={{ padding: '12px 16px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Price</th>
                                                <th style={{ padding: '12px 16px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                                                <th style={{ padding: '12px 16px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                    <td style={{ padding: '16px', fontSize: '14px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-light)' }}>
                                                        #{order.id}
                                                    </td>
                                                    <td style={{ padding: '16px', fontSize: '14px' }}>
                                                        {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td style={{ padding: '16px', fontSize: '14px' }}>
                                                        {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
                                                    </td>
                                                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: 'var(--accent-gold)' }}>
                                                        ₹{order.total.toFixed(2)}
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span className={getStatusBadgeClass(order.status)}>
                                                            {order.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                                        <Link href={`/orders/${order.id}`} className="btn-accent" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
                                                            Details & Tracking ➔
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
                </div>
            </section>

            <Footer />
        </>
    );
}
