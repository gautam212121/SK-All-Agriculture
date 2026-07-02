'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useApp } from '../../context/AppContext';

function CartContent() {
    const { setCartCount } = useApp();
    const searchParams = useSearchParams();
    
    // States
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [platformFee, setPlatformFee] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const error = searchParams.get('error');
        if (error) {
            setErrorMsg(decodeURIComponent(error));
        }
        fetchCart();
    }, [searchParams]);

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart');
            const data = await res.json();
            if (data.success) {
                setCartItems(data.cartItems || []);
                setSubtotal(data.subtotal || 0);
                setPlatformFee(data.platformFee || 0);
                setTotal(data.total || 0);
                
                // Sync cart count
                const totalQty = (data.cartItems || []).reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalQty);
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (productId, currentQty, stock, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1 || newQty > stock) return;

        try {
            const res = await fetch('/api/cart/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: newQty })
            });
            const data = await res.json();
            if (data.success) {
                fetchCart();
            } else {
                alert(data.message || 'Failed to update quantity.');
            }
        } catch (err) {
            console.error('Error updating quantity:', err);
            alert('Connection error. Try again.');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const res = await fetch('/api/cart/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || 'Item removed from cart.');
                fetchCart();
            } else {
                alert(data.message || 'Failed to remove item.');
            }
        } catch (err) {
            console.error('Error removing item:', err);
            alert('Connection error. Try again.');
        }
    };

    return (
        <>
            <Header />

            {errorMsg && (
                <div className="container" style={{ marginTop: '30px', marginBottom: '-20px' }}>
                    <div className="alert alert-danger">{errorMsg}</div>
                </div>
            )}

            <div className="container" style={{ padding: '40px 24px 80px 24px' }} id="cart-items-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                        <h2>Loading Shopping Cart...</h2>
                    </div>
                ) : cartItems.length > 0 ? (
                    <div className="cart-layout">
                        {/* ITEMS TABLE */}
                        <div className="cart-table-card">
                            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <div style={{ flexGrow: 1 }}>Spare Part Details</div>
                                <div style={{ width: '150px', textAlign: 'center' }}>Quantity</div>
                                <div style={{ width: '120px', textAlign: 'right' }}>Total Price</div>
                            </div>
                            
                            <div>
                                {cartItems.map(item => (
                                    <div key={item.id} className="cart-item-row" data-product-id={item.id}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexGrow: 1 }}>
                                            <div className="cart-item-img">
                                                <img src={item.main_image} alt={item.name} />
                                            </div>
                                            <div>
                                                <span className="cart-item-brand">{item.brand}</span>
                                                <h3 className="cart-item-title">
                                                    <Link href={`/product/${item.slug}`} style={{ color: 'var(--text-light)' }}>
                                                        {item.name}
                                                    </Link>
                                                </h3>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '4px' }}>
                                                    <span>SKU: {item.sku}</span>
                                                    <span>Price: ₹{item.activePrice.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Quantity Spinner */}
                                        <div style={{ width: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                            <div className="qty-spinner">
                                                <button 
                                                    type="button" 
                                                    className="btn-minus"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity, item.stock, -1)}
                                                >
                                                    −
                                                </button>
                                                <input type="number" value={item.quantity} min="1" max={item.stock} readOnly />
                                                <button 
                                                    type="button" 
                                                    className="btn-plus"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity, item.stock, 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            {item.stock <= 3 && (
                                                <span style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                                                    Only {item.stock} left
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Item Total & Actions */}
                                        <div style={{ width: '120px', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                            <span className="cart-item-price">₹{item.total.toFixed(2)}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="cart-item-action btn-remove-cart" 
                                                style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: 550, fontFamily: 'inherit', color: '#e53935', cursor: 'pointer' }}
                                            >
                                                🗑️ Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* INVOICE SUMMARY */}
                        <div className="cart-summary-card">
                            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                                Order Summary
                            </h3>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Platform Service Fee</span>
                                <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                                    {platformFee > 0 ? `₹${platformFee.toFixed(2)}` : 'Free'}
                                </span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery Mode</span>
                                <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>COD Only</span>
                            </div>
                            <div className="summary-row total-row">
                                <span>Estimated Total</span>
                                <span style={{ fontFamily: "'Outfit', sans-serif" }}>₹{total.toFixed(2)}</span>
                            </div>
                            <div style={{ marginTop: '30px' }}>
                                <Link href="/checkout" className="btn-accent" style={{ display: 'block', textAlign: 'center', padding: '14px 0' }}>
                                    Proceed to Checkout (COD)
                                </Link>
                            </div>
                            <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                <Link href="/shop" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    ← Continue Shopping Catalog
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '100px 40px', textAlign: 'center' }}>
                        <span style={{ fontSize: '64px' }}>🛒</span>
                        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', marginTop: '24px', marginBottom: '10px' }}>Your Shopping Cart is Empty</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '420px', margin: '0 auto 30px auto' }}>It looks like you haven&apos;t added any tractor or rotavator replacement parts to your cart yet.</p>
                        <Link href="/shop" className="btn-accent" style={{ display: 'inline-block', padding: '12px 36px' }}>
                            Browse Spare Parts Catalog
                        </Link>
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}

export default function Cart() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}><h3>Loading Cart...</h3></div>}>
            <CartContent />
        </Suspense>
    );
}
