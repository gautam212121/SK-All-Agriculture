'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Register() {
    const router = useRouter();

    // Form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password, confirmPassword })
            });
            const data = await res.json();
            
            if (data.success) {
                router.push(`/login?success=${encodeURIComponent(data.message || 'Registration successful! Please login.')}`);
            } else {
                alert(data.message || 'Registration failed.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            alert('Connection error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Header />

            <section className="section-padding" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifycontent: 'center', background: 'linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.95) 100%)' }}>
                <div className="container" style={{ maxWidth: '520px' }}>
                    <div className="checkout-form-card" style={{ padding: '40px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', boxShadow: '0 15px 35px rgba(0,0,0,0.4)' }}>
                        
                        {/* Title Header */}
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌾</div>
                            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', color: 'var(--text-light)', marginBottom: '8px' }}>Create Customer Account</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.4' }}>Sign up to easily place spare parts orders with farm GPS location tracking.</p>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexdirection: 'column', gap: '16px' }}>
                            {/* Full Name */}
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label htmlFor="name">Full Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required 
                                    className="form-control" 
                                    placeholder="Ajeet Gautam" 
                                />
                            </div>

                            {/* Email Address */}
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label htmlFor="email">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                    className="form-control" 
                                    placeholder="ajeet@gmail.com" 
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label htmlFor="phone">Mobile Number (WhatsApp Enabled)</label>
                                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'monospace', fontWeight: '600' }}>+91</span>
                                    <input 
                                        type="tel" 
                                        id="phone" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required 
                                        pattern="[0-9]{10}" 
                                        className="form-control" 
                                        style={{ paddingLeft: '50px' }} 
                                        placeholder="9026754812" 
                                    />
                                </div>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Required to send checkout invoices and coordinate delivery.</span>
                            </div>

                            {/* Password */}
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label htmlFor="password">Create Security Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    minlength="6" 
                                    className="form-control" 
                                    placeholder="••••••••" 
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label htmlFor="confirmPassword">Re-type Security Password</label>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required 
                                    minlength="6" 
                                    className="form-control" 
                                    placeholder="••••••••" 
                                />
                            </div>

                            {/* Submit Button */}
                            <div style={{ marginTop: '10px' }}>
                                <button type="submit" className="btn-accent" style={{ width: '100%', padding: '14px 0', fontSize: '15px', fontWeight: '600' }} disabled={submitting}>
                                    {submitting ? '⏳ Registering...' : 'Register Account ➔'}
                                </button>
                            </div>
                        </form>

                        {/* Navigation Links */}
                        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                            Already have an account? 
                            <Link href="/login" style={{ color: 'var(--accent-gold)', fontWeight: 600, textDecoration: 'none', marginLeft: '4px' }}>Sign in here</Link>
                        </div>

                    </div>

                    {/* Return to Homepage */}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Link href="/" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            ← Back to Storefront Home
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
