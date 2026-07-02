'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../context/AppContext';

function HeaderContent() {
    const { user, cartCount, theme, toggleTheme, logout } = useApp();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    
    const router = useRouter();
    const searchParams = useSearchParams();

    // Sync search query state with URL search param
    useEffect(() => {
        const query = searchParams.get('search') || '';
        setSearchQuery(query);
    }, [searchParams]);

    // Fetch categories for mobile drawer
    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch('/api/home');
                const data = await res.json();
                if (data.success && data.categories) {
                    setCategories(data.categories);
                }
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        }
        loadCategories();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
        } else {
            router.push('/shop');
        }
        setMobileSearchOpen(false);
        setMobileMenuOpen(false);
    };

    return (
        <>
            <header className="container">
                <nav className="navbar">
                    {/* Left group: Hamburger Menu + Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                        <button 
                            className="mobile-nav-toggle" 
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Toggle Mobile Menu" 
                            style={{ padding: '8px 4px' }}
                        >
                            ☰
                        </button>

                        <Link href="/" className="logo-container">
                            <img src="/images/logo.png" alt="SK All Agriculture Parts Logo" className="logo-img" />
                            <span className="logo-text">SK All Agriculture Parts</span>
                        </Link>
                    </div>

                    {/* Mobile Search Toggle Button */}
                    <div 
                        className="mobile-search-toggle" 
                        onClick={() => setMobileSearchOpen(true)}
                    >
                        🔍
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="nav-search">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search rotavator yoke, universal joint, shaft parts..." 
                        />
                        <span className="search-icon" onClick={handleSearchSubmit} style={{ cursor: 'pointer' }}>🔍</span>
                    </form>

                    {/* Navigation Links */}
                    <ul className="nav-menu">
                        <li><Link href="/" className="nav-link">Home</Link></li>
                        <li><Link href="/shop" className="nav-link">Shop Parts</Link></li>
                        <li><Link href="/#categories-section" className="nav-link">Categories</Link></li>
                        <li><Link href="/#contact-section" className="nav-link">Inquiry</Link></li>
                    </ul>

                    {/* Action Buttons */}
                    <div className="nav-actions">
                        {/* Theme Toggle Button */}
                        <button 
                            onClick={toggleTheme} 
                            className="theme-toggle-btn" 
                            aria-label="Toggle Dark/Light Mode" 
                            style={{
                                background: 'none', 
                                border: 'none', 
                                fontSize: '20px', 
                                cursor: 'pointer', 
                                padding: '6px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: 'var(--text-light)', 
                                transition: 'var(--transition-fast)', 
                                marginRight: '8px'
                            }}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>

                        {/* Cart Button */}
                        <Link href="/cart" className="cart-icon-btn" aria-label="View Cart">
                            <span>🛒</span>
                            {cartCount > 0 && (
                                <span className="cart-badge" style={{ display: 'block' }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Profile Dropdown / Login Button */}
                        <div className="desktop-auth-container" style={{ display: 'flex', alignItems: 'center' }}>
                            {!user ? (
                                <Link href="/login" className="btn-login">Sign In</Link>
                            ) : (
                                <div 
                                    className="profile-menu-container" 
                                    style={{ display: 'block', marginLeft: '10px', position: 'relative' }}
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                >
                                    <div className="profile-avatar-btn" style={{ cursor: 'pointer' }}>
                                        <div className="avatar-circle">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span style={{ 
                                            fontSize: '14px', 
                                            fontWeight: 600, 
                                            maxWidth: '80px', 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis', 
                                            whiteSpace: 'nowrap' 
                                        }}>
                                            {user.name.split(' ')[0]}
                                        </span>
                                        <span style={{ fontSize: '10px' }}>▼</span>
                                    </div>
                                    
                                    {profileDropdownOpen && (
                                        <div className="profile-dropdown" style={{ display: 'block', position: 'absolute', right: 0, top: '100%', zIndex: 1000 }}>
                                            <Link href="/profile" className="dropdown-item">My Profile</Link>
                                            <Link href="/orders" className="dropdown-item">My Orders</Link>
                                            <button 
                                                type="button" 
                                                onClick={logout} 
                                                className="dropdown-item" 
                                                style={{ 
                                                    color: '#e53935', 
                                                    fontWeight: 600, 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    width: '100%', 
                                                    textAlign: 'left', 
                                                    cursor: 'pointer', 
                                                    fontFamily: 'inherit' 
                                                }}
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Navigation Drawer Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="mobile-drawer-overlay" 
                    style={{ display: 'block', opacity: 1 }}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Navigation Drawer Sidebar */}
            <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} style={{ display: mobileMenuOpen ? 'block' : 'none' }}>
                <div className="mobile-drawer-header">
                    <div className="logo-container">
                        <img src="/images/logo.png" alt="SK All Agriculture Parts Logo" className="logo-img" />
                        <span className="logo-text" style={{ color: 'var(--text-light)', fontFamily: 'Outfit', fontWeight: 800, fontSize: '22px' }}>
                            SK All Agriculture Parts
                        </span>
                    </div>
                    <button 
                        className="mobile-drawer-close" 
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Close Mobile Menu"
                    >
                        ×
                    </button>
                </div>
                
                <div className="mobile-drawer-body">
                    {/* Mobile Search Form */}
                    <form onSubmit={handleSearchSubmit} className="mobile-drawer-search" style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search spare parts..." 
                            style={{ 
                                width: '100%', 
                                padding: '12px 18px 12px 42px', 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid var(--border-light)', 
                                borderRadius: 'var(--radius-full)', 
                                color: 'var(--text-light)', 
                                fontSize: '14px' 
                            }}
                        />
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px' }}>
                            🔍
                        </span>
                    </form>

                    {/* Mobile Drawer Navigation Links */}
                    <ul className="mobile-drawer-menu">
                        <li>
                            <Link href="/" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>
                                🌾 Storefront Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/shop" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>
                                🛒 Browse Spare Parts
                            </Link>
                        </li>
                        <li>
                            <Link href="/#categories-section" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>
                                🗂️ Categories Catalog
                            </Link>
                        </li>
                        <li>
                            <Link href="/#contact-section" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>
                                📞 Technical Inquiry
                            </Link>
                        </li>
                        
                        <li className="mobile-drawer-divider"></li>
                        
                        {/* Mobile Categories Section */}
                        {categories.length > 0 && (
                            <div className="mobile-drawer-categories">
                                <div className="mobile-drawer-category-title">🛍️ Shop by Categories</div>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className="mobile-drawer-category-item"
                                        onClick={() => {
                                            router.push(`/shop?category=${cat.slug}`);
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        <span className="mobile-drawer-category-icon">{cat.icon || '📦'}</span>
                                        <span>{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        <li className="mobile-drawer-divider"></li>
                        
                        {/* Mobile Dynamic Authentication Links */}
                        {!user ? (
                            <li>
                                <Link 
                                    href="/login" 
                                    className="mobile-drawer-link" 
                                    style={{ color: 'var(--accent-gold)', fontWeight: 700 }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    🔑 Customer Sign In ➔
                                </Link>
                            </li>
                        ) : (
                            <li>
                                <Link 
                                    href="/profile" 
                                    className="mobile-drawer-link"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    👤 My Account Profile
                                </Link>
                                <Link 
                                    href="/orders" 
                                    className="mobile-drawer-link"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    🚜 My Order History Log
                                </Link>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        logout();
                                        setMobileMenuOpen(false);
                                    }} 
                                    className="mobile-drawer-link" 
                                    style={{ 
                                        color: '#e53935', 
                                        fontWeight: 700, 
                                        background: 'none', 
                                        border: 'none', 
                                        width: '100%', 
                                        textAlign: 'left', 
                                        cursor: 'pointer', 
                                        fontFamily: 'inherit', 
                                        fontSize: '15px', 
                                        padding: '14px 16px', 
                                        borderRadius: 'var(--radius-md)' 
                                    }}
                                >
                                    🚪 Secure Sign Out ➔
                                </button>
                            </li>
                        )}
                    </ul>
                    
                    {/* Mobile Drawer Footer */}
                    <div style={{ padding: '16px', borderTop: '1px solid rgba(228, 161, 21, 0.15)', marginTop: 'auto', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        <div style={{ marginBottom: '12px', fontWeight: 600, color: 'var(--text-light)' }}>📞 Contact Us</div>
                        <div>📧 support@skagri.com</div>
                        <div>☎️ +91 8800 XXXX XX</div>
                        <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--accent-gold)' }}>🚚 Free Delivery | COD Available</div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {mobileSearchOpen && (
                <div id="mobile-search-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: 100 + '%', height: '80px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', zIndex: 2000, alignItems: 'center', padding: '0 20px', gap: '12px', boxShadow: 'var(--shadow-md)', boxSizing: 'border-box' }}>
                    <form onSubmit={handleSearchSubmit} style={{ flexGrow: 1, display: 'flex', alignItems: 'center', position: 'relative', margin: 0 }}>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search spare parts..." 
                            style={{ width: '100%', padding: '12px 40px 12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-full)', color: 'var(--text-light)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                            autoFocus
                        />
                        <button type="submit" style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>🔍</button>
                    </form>
                    <button 
                        onClick={() => setMobileSearchOpen(false)} 
                        style={{ background: 'none', border: 'none', fontSize: '28px', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
                    >
                        ×
                    </button>
                </div>
            )}
        </>
    );
}

export default function Header() {
    return (
        <Suspense fallback={null}>
            <HeaderContent />
        </Suspense>
    );
}
