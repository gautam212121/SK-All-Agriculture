'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Success() {
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(3);
    const [redirected, setRedirected] = useState(false);

    useEffect(() => {
        async function fetchLastOrder() {
            try {
                const res = await fetch('/api/orders/last-success');
                const data = await res.json();
                if (data.success) {
                    setOrder(data.order);
                } else {
                    router.push('/');
                }
            } catch (err) {
                console.error('Error fetching last order:', err);
                router.push('/');
            } finally {
                setLoading(false);
            }
        }
        fetchLastOrder();
    }, [router]);

    // Countdown and automatic redirect
    useEffect(() => {
        if (!order) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setRedirected(true);
                    window.location.href = order.waLink;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [order]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <h3>Fetching order receipt...</h3>
                </div>
                <Footer />
            </>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <>
            <Header />

            <section className="section-padding" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
                <div className="container" style={{ maxWidth: '650px' }}>
                    
                    <div id="success-receipt-card" className="checkout-summary-card" style={{ textAlign: 'center', padding: '40px', border: '1px solid var(--accent-gold)', boxShadow: '0 10px 40px rgba(212, 175, 55, 0.08)', background: 'var(--bg-surface)' }}>
                        
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🌾</div>
                        
                        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '32px', color: 'var(--text-light)', marginBottom: '12px' }}>Order Submitted!</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 30px auto' }}>
                            Your Cash on Delivery order has been registered on our servers. To ensure immediate dispatch, please send the invoice receipt to our store operator on WhatsApp.
                        </p>

                        {/* Order Details Widget */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '30px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed var(--border-light)', paddingBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Order Status</span>
                                <span className="status-badge pending" style={{ fontSize: '12px' }}>PENDING CONFIRMATION</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Order Identifier</span>
                                <span id="success-order-id" style={{ color: 'var(--text-light)', fontWeight: '700', fontFamily: 'monospace', fontSize: '15px' }}>
                                    #{order.id}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Payment Mode</span>
                                <span style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '14px' }}>Cash on Delivery (COD)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '12px' }}>
                                <span style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '15px' }}>Amount Payable</span>
                                <span id="success-grand-total" style={{ color: 'var(--accent-gold)', fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700 }}>
                                    ₹{order.total.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div style={{ marginBottom: '24px' }}>
                            <a 
                                id="success-wa-btn" 
                                href={order.waLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-accent" 
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px 0', fontSize: '16px', backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff', textDecoration: 'none' }}
                            >
                                <span style={{ fontSize: '20px' }}>💬</span> Send Invoice to WhatsApp
                            </a>
                        </div>

                        {/* Redirect Countdown */}
                        <div id="success-countdown-wrapper" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {!redirected ? (
                                <>
                                    Redirecting to WhatsApp automatically in <span id="success-countdown-number" style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '15px' }}>{countdown}</span> seconds...
                                </>
                            ) : (
                                "Opening WhatsApp now. If it didn't open, please click the button above."
                            )}
                        </div>
                        
                    </div>

                    {/* Return Button */}
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <Link href="/orders" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'underline' }}>
                            Or view your Order History
                        </Link>
                    </div>

                </div>
            </section>

            <Footer />
        </>
    );
}
