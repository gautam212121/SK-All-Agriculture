'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useApp } from '../../context/AppContext';

export default function Checkout() {
    const { user, loading: authLoading, setCartCount } = useApp();
    const router = useRouter();

    // Data States
    const [addresses, setAddresses] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [platformFee, setPlatformFee] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // Selected Address & Geolocation States
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [geoStatus, setGeoStatus] = useState('Location not pinned yet.');
    const [geoStatusClass, setGeoStatusClass] = useState('');

    // New Address Form States
    const [recipientName, setRecipientName] = useState('');
    const [phone, setPhone] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [city, setCity] = useState('Lucknow');
    const [state, setState] = useState('Uttar Pradesh');
    const [pincode, setPincode] = useState('');
    const [saveAddress, setSaveAddress] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    // 1. Protect Route & Fetch Checkout Data
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirectTo=/checkout');
            return;
        }

        if (user) {
            fetchCheckoutData();
        }
    }, [user, authLoading, router]);

    const fetchCheckoutData = async () => {
        try {
            const res = await fetch('/api/checkout');
            if (res.status === 400) {
                router.push('/cart');
                return;
            }
            const data = await res.json();
            if (data.success) {
                setAddresses(data.addresses || []);
                setCartItems(data.cartItems || []);
                setSubtotal(data.subtotal || 0);
                setPlatformFee(data.platformFee || 0);
                setTotal(data.total || 0);

                // Pre-select first address if available
                if (data.addresses && data.addresses.length > 0) {
                    setSelectedAddressId(data.addresses[0].id.toString());
                } else {
                    setSelectedAddressId('new');
                }
            }
        } catch (err) {
            console.error('Error fetching checkout data:', err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Geolocation Pinning
    const handlePinLocation = () => {
        setGeoStatus('Acquiring coordinates...');
        setGeoStatusClass('warning');

        if (!navigator.geolocation) {
            setGeoStatus('Geolocation not supported by browser.');
            setGeoStatusClass('error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setLatitude(lat.toString());
                setLongitude(lng.toString());
                setGeoStatus(`📍 Farm location pinned (lat: ${lat.toFixed(4)}, lng: ${lng.toFixed(4)})`);
                setGeoStatusClass('success');
            },
            (error) => {
                console.warn('Geolocation error:', error);
                let msg = 'Could not retrieve coordinates. Fill address details manually.';
                if (error.code === error.PERMISSION_DENIED) {
                    msg = 'Permission denied. Please allow location access to pin farm.';
                }
                setGeoStatus(msg);
                setGeoStatusClass('error');
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    };

    // 3. Submit Order
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (selectedAddressId === 'new') {
            if (!recipientName || !phone || !addressLine || !city || !state || !pincode) {
                alert('Please fill out all required shipping details.');
                return;
            }
        }

        setSubmitting(true);

        const formData = {
            selected_address_id: selectedAddressId === 'new' ? '' : selectedAddressId,
            recipient_name: selectedAddressId === 'new' ? recipientName : '',
            phone: selectedAddressId === 'new' ? phone : '',
            address_line: selectedAddressId === 'new' ? addressLine : '',
            city: selectedAddressId === 'new' ? city : '',
            state: selectedAddressId === 'new' ? state : '',
            pincode: selectedAddressId === 'new' ? pincode : '',
            latitude,
            longitude,
            save_address: selectedAddressId === 'new' && saveAddress ? 'on' : ''
        };

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (data.success) {
                setCartCount(0); // Clear header cart count
                router.push('/success');
            } else {
                alert(data.message || 'Order placement failed.');
            }
        } catch (err) {
            console.error('Order placement error:', err);
            alert('Connection error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <>
                <Header />
                <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <h3>Securing checkout session...</h3>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
                {/* Path breadcrumbs */}
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px' }}>
                    <Link href="/" style={{ color: 'var(--text-light)' }}>Home</Link> &nbsp;/&nbsp;
                    <Link href="/cart" style={{ color: 'var(--text-light)' }}>Shopping Cart</Link> &nbsp;/&nbsp;
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Checkout Billing</span>
                </div>

                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '32px', marginBottom: '30px' }}>Checkout Billing</h1>

                <form onSubmit={handleSubmit}>
                    {/* 2 Column Layout */}
                    <div className="cart-layout">
                        
                        {/* BILLING & GEOLOCATION INFO (LEFT) */}
                        <div>
                            {/* 1. ADDRESS BOOK SELECTOR */}
                            <div className="cart-table-card" style={{ marginBottom: '30px' }}>
                                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                                    1. Shipping Address
                                </h3>
                                
                                {/* Saved Address grid */}
                                <div className="address-grid checkout-address-selector" style={{ marginBottom: '30px' }}>
                                    {addresses.map((addr) => (
                                        <div 
                                            key={addr.id} 
                                            className={`address-card ${selectedAddressId === addr.id.toString() ? 'selected' : ''}`}
                                            onClick={() => setSelectedAddressId(addr.id.toString())}
                                        >
                                            <div className="address-name">{addr.recipient_name}</div>
                                            <div className="address-text">
                                                {addr.address_line}<br />
                                                {addr.city}, {addr.state} - {addr.pincode}<br />
                                                📞 {addr.phone}
                                            </div>
                                            {addr.is_default && (
                                                <span className="status-badge delivered" style={{ fontSize: '9px', padding: '2px 6px', marginTop: '8px', display: 'inline-block' }}>
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {/* "Use New Address" card */}
                                    <div 
                                        className={`address-card ${selectedAddressId === 'new' ? 'selected' : ''}`}
                                        onClick={() => setSelectedAddressId('new')}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderStyle: 'dashed', backgroundColor: 'transparent' }}
                                    >
                                        <span style={{ fontSize: '24px', color: 'var(--accent-gold)', marginBottom: '6px' }}>➕</span>
                                        <div className="address-name" style={{ color: 'var(--accent-gold)' }}>Use a New Address</div>
                                        <div className="address-text" style={{ fontSize: '11px' }}>Fill out the shipping details below</div>
                                    </div>
                                </div>

                                {/* NEW ADDRESS FORM FIELDS */}
                                {selectedAddressId === 'new' && (
                                    <div className="new-address-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                Enter New Shipping Details
                                            </h4>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="recipient_name">Recipient Full Name *</label>
                                            <input 
                                                type="text" 
                                                id="recipient_name" 
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                                required 
                                                className="form-control" 
                                                placeholder="Ajeet Gautam" 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phone">Mobile Number (WhatsApp Preferred) *</label>
                                            <input 
                                                type="tel" 
                                                id="phone" 
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required 
                                                className="form-control" 
                                                placeholder="9026754812" 
                                            />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                            <label htmlFor="address_line">Street Address / Village / BKT Area *</label>
                                            <input 
                                                type="text" 
                                                id="address_line" 
                                                value={addressLine}
                                                onChange={(e) => setAddressLine(e.target.value)}
                                                required 
                                                className="form-control" 
                                                placeholder="BKT Lucknow, Near Canal Road" 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="city">City / Town *</label>
                                            <input 
                                                type="text" 
                                                id="city" 
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                required 
                                                className="form-control" 
                                                placeholder="Lucknow" 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="state">State *</label>
                                            <input 
                                                type="text" 
                                                id="state" 
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                required 
                                                className="form-control" 
                                                placeholder="Uttar Pradesh" 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="pincode">Pincode / Postal Code *</label>
                                            <input 
                                                type="text" 
                                                id="pincode" 
                                                value={pincode}
                                                onChange={(e) => setPincode(e.target.value)}
                                                required 
                                                className="form-control" 
                                                placeholder="226021" 
                                            />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: 'span 2', flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                            <input 
                                                type="checkbox" 
                                                id="save_address" 
                                                checked={saveAddress}
                                                onChange={(e) => setSaveAddress(e.target.checked)}
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)' }} 
                                            />
                                            <label htmlFor="save_address" style={{ cursor: 'pointer', fontSize: '14px', color: 'var(--text-light)' }}>
                                                Save this address to my profile book
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 2. FARM GEOLOCATION PINNING */}
                            <div className="cart-table-card">
                                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                                    2. Farm Geolocation Pin (Recommended)
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                                    If you are ordering from a rural area, field, or farm, pin your GPS coordinates. Our delivery rider will receive a precise Google Maps pin directly on their WhatsApp to navigate straight to your site.
                                </p>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                    <button 
                                        type="button" 
                                        onClick={handlePinLocation}
                                        className="admin-btn admin-btn-secondary" 
                                        style={{ padding: '12px 24px', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                                    >
                                        📍 Pin My Farm Location
                                    </button>
                                    <span id="geo-status-text" className={`geo-status-text ${geoStatusClass}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                                        {geoStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* INVOICE SUMMARY SIDEBAR (RIGHT) */}
                        <div className="cart-summary-card">
                            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                                Order Invoice
                            </h3>
                            
                            {/* Items details list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '240px', overflowY: 'auto', marginBottom: '24px', paddingRight: '6px' }}>
                                {cartItems.map(item => (
                                    <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', fontSize: '13px' }}>
                                        <div style={{ flexGrow: 1 }}>
                                            <span style={{ fontWeight: 600, color: 'var(--text-light)' }}>{item.name}</span>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {item.brand} &bull; Qty: {item.quantity}
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>₹{item.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

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
                                <span>Payment Method</span>
                                <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>CASH ON DELIVERY</span>
                            </div>

                            <div className="summary-row total-row">
                                <span>Grand Total</span>
                                <span style={{ fontFamily: "'Outfit', sans-serif" }}>₹{total.toFixed(2)}</span>
                            </div>

                            <div style={{ marginTop: '30px' }}>
                                <button 
                                    type="submit" 
                                    className="btn-accent" 
                                    style={{ width: '100%', padding: '16px 0', fontSize: '16px', border: 'none', cursor: 'pointer' }}
                                    disabled={submitting}
                                >
                                    {submitting ? '⏳ Processing Order...' : 'Place COD Order ➔'}
                                </button>
                            </div>

                            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                                🔒 Direct WhatsApp confirmation receipt will generate on next screen.
                            </div>
                        </div>

                    </div>
                </form>
            </div>

            <Footer />
        </>
    );
}
