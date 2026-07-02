'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useApp } from '../../context/AppContext';

export default function Profile() {
    const { user, loading: authLoading } = useApp();
    const router = useRouter();

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Address Form States
    const [recipientName, setRecipientName] = useState('');
    const [phone, setPhone] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [city, setCity] = useState('Lucknow');
    const [state, setState] = useState('Uttar Pradesh');
    const [pincode, setPincode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Protect route and load addresses
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirectTo=/profile');
            return;
        }

        if (user) {
            fetchAddresses();
        }
    }, [user, authLoading, router]);

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            if (data.success) {
                setAddresses(data.addresses || []);
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/profile/address/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient_name: recipientName,
                    phone,
                    address_line: addressLine,
                    city,
                    state,
                    pincode
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || 'Address added!');
                setRecipientName('');
                setPhone('');
                setAddressLine('');
                setCity('Lucknow');
                setState('Uttar Pradesh');
                setPincode('');
                fetchAddresses();
            } else {
                alert(data.message || 'Failed to add address.');
            }
        } catch (err) {
            console.error('Error adding address:', err);
            alert('Connection error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const res = await fetch(`/api/profile/address/delete/${addressId}`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || 'Address deleted.');
                fetchAddresses();
            } else {
                alert(data.message || 'Failed to delete address.');
            }
        } catch (err) {
            console.error('Error deleting address:', err);
            alert('Connection error. Try again.');
        }
    };

    if (authLoading || loading) {
        return (
            <>
                <Header />
                <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <h3>Loading profile session...</h3>
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
                                <div className="profile-user-avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--accent-gold)', color: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', margin: '0 auto 12px auto', fontFamily: "'Outfit', sans-serif" }}>
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
                                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--accent-gold)', background: 'rgba(212, 175, 55, 0.05)', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
                                        👤 Profile & Addresses
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            
                            {/* Profile Information Section */}
                            <div className="checkout-form-card" style={{ padding: '30px', background: 'var(--bg-surface)' }}>
                                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', color: 'var(--text-light)', marginBottom: '20px' }}>
                                    Customer Profile Credentials
                                </h2>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Full Name</div>
                                        <div style={{ fontSize: '16px', color: 'var(--text-light)', fontWeight: '700' }}>{user.name}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Mobile Number</div>
                                        <div style={{ fontSize: '16px', color: 'var(--text-light)', fontWeight: '700' }}>+91 {user.phone}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Email Address</div>
                                        <div style={{ fontSize: '16px', color: 'var(--text-light)', fontWeight: '700' }}>{user.email}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Addresses List Directory */}
                            <div className="checkout-form-card" style={{ padding: '30px', background: 'var(--bg-surface)' }}>
                                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', color: 'var(--text-light)', marginBottom: '6px' }}>
                                    Saved Shipping Address Book
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
                                    Addresses saved here will be available for quick-select during spare parts checkout.
                                </p>
                                
                                <div className="checkout-address-selector" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', display: 'grid' }}>
                                    {addresses.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px' }}>No saved addresses found. Please add one below.</p>
                                    ) : (
                                        addresses.map(addr => (
                                            <div key={addr.id} className="address-card" style={{ cursor: 'default' }}>
                                                <div className="address-name">{addr.recipient_name}</div>
                                                <div className="address-text">
                                                    {addr.address_line}<br />
                                                    {addr.city}, {addr.state} - {addr.pincode}<br />
                                                    📞 {addr.phone}
                                                </div>
                                                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    {addr.is_default ? (
                                                        <span className="status-badge delivered" style={{ fontSize: '9px', padding: '2px 6px' }}>Default</span>
                                                    ) : <span />}
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                        style={{ background: 'none', border: 'none', color: '#e53935', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Add Address Form Sheet */}
                            <div className="checkout-form-card" style={{ padding: '30px', background: 'var(--bg-surface)' }}>
                                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', color: 'var(--text-light)', marginBottom: '6px' }}>
                                    Add a New Shipping Address
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
                                    Provide accurate shipping coordinates to minimize dispatch delays.
                                </p>

                                <form onSubmit={handleAddAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <label htmlFor="recipient_name">Recipient Full Name</label>
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
                                        <label htmlFor="phone">Recipient Mobile Number</label>
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

                                    <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
                                        <label htmlFor="address_line">Detailed Address (House/Plot, Village/Area, Landmark)</label>
                                        <input 
                                            type="text" 
                                            id="address_line" 
                                            value={addressLine}
                                            onChange={(e) => setAddressLine(e.target.value)}
                                            required 
                                            className="form-control" 
                                            placeholder="Plot 14, Near Primary School, BKT" 
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="city">City / Tehsil</label>
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
                                        <label htmlFor="state">State</label>
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
                                        <label htmlFor="pincode">PIN Code (6 digits)</label>
                                        <input 
                                            type="text" 
                                            id="pincode" 
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            required 
                                            pattern="[0-9]{6}" 
                                            className="form-control" 
                                            placeholder="226201" 
                                        />
                                    </div>

                                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                        <button type="submit" className="btn-accent" style={{ width: '100%', padding: '12px 0', border: 'none', cursor: 'pointer' }} disabled={submitting}>
                                            {submitting ? '⏳ Saving...' : '💾 Save New Address'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
