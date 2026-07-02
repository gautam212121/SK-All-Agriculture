'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useApp } from '../../context/AppContext';

function LoginContent() {
    const { setUser, setAdmin, syncSession } = useApp();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check if it's admin login based on URL query (?admin=true)
    const isAdmin = searchParams.get('admin') === 'true';
    const redirectTo = searchParams.get('redirectTo') || '';
    const successMsg = searchParams.get('success') || '';

    // Form inputs
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (successMsg) {
            alert(successMsg);
        }
    }, [successMsg]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const targetUrl = isAdmin ? '/api/auth/admin/login' : '/api/auth/login';
        const bodyData = isAdmin 
            ? { username, password }
            : { email, password };

        try {
            const res = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
                credentials: 'include'
            });
            const data = await res.json();
            
            if (data.success) {
                alert(data.message || 'Login successful!');
                
                // Sync session globally
                await syncSession();

                setTimeout(() => {
                    if (isAdmin) {
                        router.push('/admin');
                    } else {
                        router.push(redirectTo || '/');
                    }
                }, 500);
            } else {
                alert(data.message || 'Login failed.');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Connection error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Header />

            <section className="section-padding" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.95) 100%)' }}>
                <div className="container" style={{ maxWidth: '480px' }}>
                    <div className="checkout-form-card" style={{ padding: '40px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', boxShadow: '0 15px 35px rgba(0,0,0,0.4)' }}>
                        
                        {/* Title Header */}
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{isAdmin ? '🛡️' : '🚜'}</div>
                            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', color: 'var(--text-light)', marginBottom: '8px' }}>
                                {isAdmin ? 'Admin Control Center' : 'Customer Sign In'}
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.4' }}>
                                {isAdmin 
                                    ? 'Sign in to manage spare parts, inventory, and orders.' 
                                    : 'Sign in to browse our catalog, manage cart, and place orders.'}
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {isAdmin ? (
                                /* Username Container (Admin) */
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label htmlFor="username">Administrative Username</label>
                                    <input 
                                        type="text" 
                                        id="username" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required 
                                        className="form-control" 
                                        placeholder="admin" 
                                    />
                                </div>
                            ) : (
                                /* Email Container (Customer) */
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                            )}

                            {/* Password Container */}
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="password">Security Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    className="form-control" 
                                    placeholder="••••••••" 
                                />
                            </div>

                            {/* Submit Button */}
                            <div style={{ marginTop: '10px' }}>
                                <button type="submit" className="btn-accent" style={{ width: '100%', padding: '14px 0', fontSize: '15px', fontWeight: '600' }} disabled={submitting}>
                                    {submitting ? '⏳ Signing In...' : isAdmin ? 'Secure Admin Login 🔑' : 'Sign In ➔'}
                                </button>
                            </div>
                        </form>

                        {/* Navigation Pathway Links */}
                        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                            {!isAdmin ? (
                                <>
                                    Don&apos;t have an account? 
                                    <Link href="/register" style={{ color: 'var(--accent-gold)', fontWeight: 600, textDecoration: 'none', marginLeft: '4px' }}>Register here</Link>
                                    <div style={{ marginTop: '12px', fontSize: '12px' }}>
                                        Are you an administrator? 
                                        <Link href="/login?admin=true" style={{ color: 'var(--text-light)', fontWeight: 500 }}>Access Control Center 🔑</Link>
                                    </div>
                                </>
                            ) : (
                                <Link href="/login" style={{ color: 'var(--accent-gold)', fontWeight: 500 }}>
                                    ← Return to Customer Storefront Login
                                </Link>
                            )}
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

export default function Login() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}><h3>Loading...</h3></div>}>
            <LoginContent />
        </Suspense>
    );
}
