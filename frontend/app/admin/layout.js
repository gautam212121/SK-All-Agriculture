'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import '../admin.css';

export default function AdminLayout({ children }) {
    const { admin, loading, logoutAdmin, theme, toggleTheme } = useApp();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Protect route: redirect to login if not admin
    useEffect(() => {
        if (!loading && !admin) {
            router.push('/login?admin=true');
        }
    }, [admin, loading, router]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0e1e17', color: 'var(--text-white)' }}>
                <div className="admin-loading-spinner" style={{ fontSize: '18px', fontFamily: 'Outfit' }}>
                    Securing Console Connection...
                </div>
            </div>
        );
    }

    if (!admin) {
        return null; // Don't render anything while redirecting
    }

    const menuItems = [
        { id: 'menu-dashboard', path: '/admin', label: 'Dashboard', icon: '' },
        { id: 'menu-products', path: '/admin/products', label: 'Manage Products', icon: '' },
        { id: 'menu-banners', path: '/admin/banners', label: 'Home Banners', icon: '🖼️' },
        { id: 'menu-orders', path: '/admin/orders', label: 'Orders', icon: '' },
        { id: 'menu-users', path: '/admin/users', label: 'Customers', icon: '' },
        { id: 'menu-inquiries', path: '/admin/inquiries', label: 'Technical Inquiries', icon: '💬' },
        { id: 'menu-inventory', path: '/admin/inventory', label: 'Stock Inventory', icon: '' },
        { id: 'menu-settings', path: '/admin/settings', label: 'Settings', icon: '' },
    ];

    // Determine current page title and description
    const getPageMeta = () => {
        if (pathname === '/admin') return { title: 'Dashboard Overview', desc: 'Fulfillment panel and settings manager.' };
        if (pathname.startsWith('/admin/products')) return { title: 'Product Catalog', desc: 'Manage catalog products, pricing, and details.' };
        if (pathname.startsWith('/admin/categories')) return { title: 'Categories Manager', desc: 'Manage spare parts categories and filters.' };
        if (pathname.startsWith('/admin/banners')) return { title: 'Home Banners', desc: 'Manage promotional banners and slides.' };
        if (pathname.startsWith('/admin/orders')) return { title: 'Order Shipments', desc: 'Monitor orders, invoices, and shipping status.' };
        if (pathname.startsWith('/admin/users')) return { title: 'Customer Registry', desc: 'View registered customer accounts.' };
        if (pathname.startsWith('/admin/inquiries')) return { title: 'Technical Inquiries', desc: 'Read and reply to product inquiries.' };
        if (pathname.startsWith('/admin/inventory')) return { title: 'Stock Inventory', desc: 'Monitor stock levels and warehouse inventory.' };
        if (pathname.startsWith('/admin/settings')) return { title: 'Admin Settings', desc: 'Configure security, backup, and store profile.' };
        return { title: 'Admin Console', desc: 'Fulfillment panel and settings manager.' };
    };

    const meta = getPageMeta();

    return (
        <div className="admin-body">
            <div className="admin-container">
                {/* Admin Sidebar */}
                <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="admin-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img 
                                src="/images/logo.png" 
                                alt="Logo" 
                                className="logo-img"
                                style={{ height: '32px', width: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent)', flexShrink: 0 }} 
                            />
                            <span>SK Agriculture Parts Admin</span>
                        </div>
                        {/* Mobile Close Button */}
                        <button 
                            className="admin-sidebar-close" 
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close Admin Menu"
                            style={{ display: sidebarOpen ? 'block' : 'none', fontSize: '28px', background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', lineHeight: 1, padding: '0 4px', transition: 'var(--transition)' }}
                        >
                            &times;
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <ul className="admin-menu">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                            return (
                                <li 
                                    key={item.id} 
                                    className={`admin-menu-item ${isActive ? 'active' : ''}`} 
                                    id={item.id}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Link href={item.path}>
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Logout Admin */}
                    <div className="admin-menu-footer">
                        <button 
                            type="button" 
                            onClick={logoutAdmin} 
                            className="admin-logout-btn"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}
                        >
                            <span></span>
                            <span>Logout Admin</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Workspace */}
                <main className="admin-main">
                    {/* Admin Header */}
                    <header className="admin-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px' }}>
                            
                            {/* Mobile Hamburger Toggle Button */}
                            <button 
                                className="admin-menu-toggle" 
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Toggle Admin Menu" 
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--admin-border)', color: 'var(--text-white)', padding: '8px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)' }}
                            >
                                ☰
                            </button>

                            <div style={{ flexGrow: 1, minWidth: 0 }}>
                                <h1 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '26px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {meta.title}
                                </h1>
                                <p className="admin-title-desc" style={{ color: 'var(--text-gray)', fontSize: '13px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {meta.desc}
                                </p>
                            </div>
                            
                            {/* Theme Toggle Button */}
                            <button 
                                onClick={toggleTheme}
                                aria-label="Toggle Dark/Light Mode" 
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--admin-border)', fontSize: '18px', cursor: 'pointer', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyAlignment: 'center', color: 'var(--text-white)', borderRadius: 'var(--radius-md)', transition: 'var(--transition)', flexShrink: 0 }}
                            >
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>

                            {/* Admin Profile Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', flexShrink: 0 }}>
                                <span style={{ fontSize: '18px' }}>🛡️</span>
                                <div style={{ textAlign: 'right' }} className="admin-header-profile-text">
                                    <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.2 }}>
                                        {admin.name || 'Admin'}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-gray)' }}>
                                        @{admin.username || 'admin'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="admin-content">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
