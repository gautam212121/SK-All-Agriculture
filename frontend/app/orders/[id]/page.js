'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useApp } from '../../../context/AppContext';

export default function OrderDetail({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const id = params.id;
    const { user, loading: authLoading } = useApp();
    const router = useRouter();

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirectTo=/orders');
            return;
        }

        if (user && id) {
            fetchOrderDetail();
        }
    }, [user, id, authLoading, router]);

    const fetchOrderDetail = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.status === 404) {
                router.push('/orders');
                return;
            }
            const data = await res.json();
            if (data.success) {
                setOrder(data.order);
                setItems(data.items || []);
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
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
                    <h3>Loading order details...</h3>
                </div>
                <Footer />
            </>
        );
    }

    if (!order) return null;

    // Build timeline steps
    const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentStatusIdx = statusOrder.indexOf(order.status.toLowerCase());

    return (
        <>
            <Header />

            <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
                {/* Breadcrumbs */}
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px' }}>
                    <Link href="/">Home</Link> &nbsp;/&nbsp;
                    <Link href="/orders">Order History</Link> &nbsp;/&nbsp;
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Order #{order.id}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '32px', margin: 0 }}>Order #{order.id}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
                            Placed on {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <span className={getStatusBadgeClass(order.status)} style={{ fontSize: '14px', padding: '8px 16px' }}>
                            {order.status.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Status Timeline */}
                {order.status.toLowerCase() !== 'cancelled' && (
                    <div className="cart-table-card" style={{ marginBottom: '30px', padding: '30px' }}>
                        <div className="admin-timeline" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '0 20px' }}>
                            {statusOrder.map((step, idx) => {
                                const isCompleted = idx <= currentStatusIdx;
                                const isActive = idx === currentStatusIdx;
                                return (
                                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1, position: 'relative' }}>
                                        <div 
                                            style={{ 
                                                width: '36px', 
                                                height: '36px', 
                                                borderRadius: '50%', 
                                                background: isCompleted ? 'var(--accent-gold)' : 'var(--bg-dark)', 
                                                border: isCompleted ? '2px solid var(--accent-gold)' : '2px solid var(--border-light)', 
                                                color: isCompleted ? 'var(--bg-dark)' : 'var(--text-muted)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                fontWeight: 'bold',
                                                fontSize: '14px',
                                                boxShadow: isActive ? '0 0 15px rgba(212,175,55,0.4)' : 'none'
                                            }}
                                        >
                                            {idx + 1}
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: isCompleted ? '600' : '400', color: isCompleted ? 'var(--text-light)' : 'var(--text-muted)', marginTop: '8px', textTransform: 'capitalize' }}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                            
                            {/* Connector Line */}
                            <div 
                                style={{ 
                                    position: 'absolute', 
                                    top: '18px', 
                                    left: '0', 
                                    width: '100%', 
                                    height: '2px', 
                                    background: 'var(--border-light)', 
                                    zIndex: 1 
                                }} 
                            />
                            <div 
                                style={{ 
                                    position: 'absolute', 
                                    top: '18px', 
                                    left: '0', 
                                    width: `${(currentStatusIdx / (statusOrder.length - 1)) * 100}%`, 
                                    height: '2px', 
                                    background: 'var(--accent-gold)', 
                                    zIndex: 1,
                                    transition: 'width 0.5s ease-in-out'
                                }} 
                            />
                        </div>
                    </div>
                )}

                {/* 2 Column Details Grid */}
                <div className="cart-layout" style={{ alignItems: 'start' }}>
                    
                    {/* LEFT COLUMN: ITEMS & ADDRESS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* 1. ORDER ITEMS */}
                        <div className="cart-table-card">
                            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                                Ordered Spare Parts
                            </h3>
                            <div>
                                {items.map(item => (
                                    <div key={item.id} className="cart-item-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '20px', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexGrow: 1 }}>
                                            <div className="cart-item-img">
                                                <img src={item.main_image} alt={item.name} />
                                            </div>
                                            <div>
                                                <span className="cart-item-brand">{item.brand}</span>
                                                <h3 className="cart-item-title" style={{ fontSize: '16px' }}>
                                                    <Link href={`/product/${item.slug}`} style={{ color: 'var(--text-light)' }}>
                                                        {item.name}
                                                    </Link>
                                                </h3>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    <span>SKU: {item.sku}</span> &bull; 
                                                    <span style={{ marginLeft: '8px' }}>Price: ₹{item.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ width: '100px', textAlign: 'center', fontSize: '14px' }}>
                                            Qty: <span style={{ fontWeight: '700', color: 'var(--text-light)' }}>{item.quantity}</span>
                                        </div>
                                        <div style={{ width: '120px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: 'var(--text-light)' }}>
                                            ₹{item.total.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. SHIPPING ADDRESS */}
                        <div className="cart-table-card">
                            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                                Shipping Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px' }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Recipient Name</div>
                                    <div style={{ fontWeight: '700', color: 'var(--text-light)' }}>{order.recipient_name}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>WhatsApp Number</div>
                                    <div style={{ fontWeight: '700', color: 'var(--text-light)' }}>+91 {order.phone}</div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Street Address</div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-light)' }}>{order.address_line}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>City & State</div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-light)' }}>{order.city}, {order.state}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Pincode</div>
                                    <div style={{ fontWeight: '700', color: 'var(--text-light)' }}>{order.pincode}</div>
                                </div>

                                {order.latitude && order.longitude && (
                                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Farm GPS Coordinates</div>
                                            <div style={{ color: 'var(--text-light)', fontFamily: 'monospace', fontWeight: '600' }}>
                                                {parseFloat(order.latitude).toFixed(5)}, {parseFloat(order.longitude).toFixed(5)}
                                            </div>
                                        </div>
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="admin-btn admin-btn-secondary"
                                            style={{ padding: '8px 16px', fontSize: '12px', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)', textDecoration: 'none' }}
                                        >
                                            🗺️ Open in Google Maps
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: INVOICE SUMMARY */}
                    <div className="cart-summary-card">
                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                            Billing Invoice
                        </h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span style={{ fontWeight: 600 }}>₹{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Platform Service Fee</span>
                            <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                                {order.platform_fee > 0 ? `₹${order.platform_fee.toFixed(2)}` : 'Free'}
                            </span>
                        </div>
                        <div className="summary-row">
                            <span>Payment Method</span>
                            <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Cash on Delivery</span>
                        </div>
                        <div className="summary-row total-row">
                            <span>Grand Total</span>
                            <span style={{ fontFamily: "'Outfit', sans-serif" }}>₹{order.total.toFixed(2)}</span>
                        </div>

                        {order.status.toLowerCase() === 'pending' && order.waLink && (
                            <div style={{ marginTop: '30px' }}>
                                <a 
                                    href={order.waLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn-accent" 
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '14px 0', fontSize: '15px', backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff', textDecoration: 'none' }}
                                >
                                    <span>💬</span> Re-send Invoice to WhatsApp
                                </a>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', lineHeight: '1.4' }}>
                                    If your order is pending confirmation, send the receipt to our operator for faster dispatch.
                                </p>
                            </div>
                        )}
                        
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <Link href="/orders" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                ← Back to Order History
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </>
    );
}
