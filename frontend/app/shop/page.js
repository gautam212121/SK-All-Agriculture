'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';

function ShopContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read query params
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const sort = searchParams.get('sort') || '';

    // Component State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Fetch Products & Filters
    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const queryStr = new URLSearchParams({ search, category, brand, sort }).toString();
                const res = await fetch(`/api/products?${queryStr}`);
                const data = await res.json();
                
                if (data.success) {
                    setProducts(data.products || []);
                    setCategories(data.categories || []);
                    setBrands(data.brands || []);
                }
            } catch (err) {
                console.error('Error loading shop catalog:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [search, category, brand, sort]);

    // Build URLs for filters
    const getFilterUrl = (newParams) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (brand) params.set('brand', brand);
        if (sort) params.set('sort', sort);

        // Apply overrides
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        const qs = params.toString();
        return `/shop${qs ? '?' + qs : ''}`;
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        const urlParams = new URLSearchParams(value.split('?')[1] || '');
        const newSort = urlParams.get('sort') || '';
        router.push(getFilterUrl({ sort: newSort }));
    };

    return (
        <>
            <Header />

            <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
                {/* Breadcrumbs */}
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                    <Link href="/" style={{ color: 'var(--text-light)' }}>Home</Link> &nbsp;/&nbsp; 
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Spare Parts Catalog</span>
                </div>

                {/* 2 Column Layout */}
                <div className="shop-layout">
                    
                    {/* SIDEBAR FILTERS */}
                    <aside className={`shop-sidebar ${drawerOpen ? 'active' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {drawerOpen && (
                                    <button 
                                        className="mobile-only-close" 
                                        onClick={() => setDrawerOpen(false)}
                                        style={{ display: 'block', background: 'none', border: 'none', fontSize: '24px', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, marginRight: '4px', lineHeight: 1 }}
                                    >
                                        ×
                                    </button>
                                )}
                                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', margin: 0 }}>Filters</h3>
                            </div>
                            <Link href="/shop" style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }} onClick={() => setDrawerOpen(false)}>
                                Clear All
                            </Link>
                        </div>

                        {/* Category Filters */}
                        <div style={{ marginBottom: '30px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Categories</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <li>
                                    <Link 
                                        href={getFilterUrl({ category: '' })}
                                        style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', color: !category ? 'var(--accent-gold)' : 'var(--text-light)', fontWeight: !category ? '700' : '400' }}
                                        onClick={() => setDrawerOpen(false)}
                                    >
                                        <span>All Categories</span>
                                    </Link>
                                </li>
                                {categories.map(cat => (
                                    <li key={cat.id}>
                                        <Link 
                                            href={getFilterUrl({ category: cat.slug })}
                                            style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', color: category === cat.slug ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: category === cat.slug ? '700' : '400' }}
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            <span>{cat.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Brand Filters */}
                        <div style={{ marginBottom: '30px', borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Brands</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <li>
                                    <Link 
                                        href={getFilterUrl({ brand: '' })}
                                        style={{ fontSize: '14px', color: !brand ? 'var(--accent-gold)' : 'var(--text-light)', fontWeight: !brand ? '700' : '400' }}
                                        onClick={() => setDrawerOpen(false)}
                                    >
                                        All Brands
                                    </Link>
                                </li>
                                {brands.map(b => (
                                    <li key={b}>
                                        <Link 
                                            href={getFilterUrl({ brand: b })}
                                            style={{ fontSize: '14px', color: brand === b ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: brand === b ? '700' : '400' }}
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            {b}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* PRODUCT LISTINGS COLUMN */}
                    <div>
                        {/* Top sorting panel */}
                        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '16px' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {loading ? (
                                    <span>Loading parts count...</span>
                                ) : (
                                    <span>
                                        Showing <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>{products.length}</span> replacement parts 
                                        {search && <> for &ldquo;<span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{search}</span>&rdquo;</>}
                                    </span>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => setDrawerOpen(true)}
                                className="btn-accent" 
                                style={{ display: 'none', padding: '8px 14px', fontSize: '12px', fontWeight: 700, alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: 'none', whiteSpace: 'nowrap' }}
                            >
                                ⚙️ Filter Parts
                            </button>
                            
                            {/* Sorting Dropdown */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <label htmlFor="shop-sort" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Sort:</label>
                                <select 
                                    id="shop-sort" 
                                    value={getFilterUrl({ sort })}
                                    onChange={handleSortChange}
                                    className="form-control" 
                                    style={{ width: '150px', padding: '8px 14px', background: 'rgba(0,0,0,0.2)', fontSize: '13px', borderRadius: 'var(--radius-sm)', marginBottom: 0 }}
                                >
                                    <option value={getFilterUrl({ sort: '' })}>Default Listing</option>
                                    <option value={getFilterUrl({ sort: 'price_asc' })}>Price: Low to High</option>
                                    <option value={getFilterUrl({ sort: 'price_desc' })}>Price: High to Low</option>
                                    <option value={getFilterUrl({ sort: 'newest' })}>New Arrivals</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <div className="product-grid">
                                <div style={{ textAlign: 'center', gridColumn: 'span 3', color: 'var(--text-muted)', padding: '80px 0' }}>Loading spare parts catalog...</div>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="product-grid">
                                {products.map(prod => (
                                    <ProductCard key={prod.id} product={prod} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '80px 40px', textAlign: 'center', width: '100%' }}>
                                <span style={{ fontSize: '48px' }}>🔍</span>
                                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', marginTop: '16px', marginBottom: '8px' }}>No Spare Parts Found</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '420px', margin: '0 auto 24px auto' }}>We couldn&apos;t find any products matching your active filters or search terms.</p>
                                <Link href="/shop" className="btn-accent" style={{ display: 'inline-block' }}>Reset Search Catalog</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Drawer Overlay */}
            {drawerOpen && (
                <div 
                    className="mobile-drawer-overlay" 
                    style={{ display: 'block', opacity: 1, zIndex: 2090 }}
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            <Footer />
        </>
    );
}

export default function Shop() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}><h3>Loading Shop...</h3></div>}>
            <ShopContent />
        </Suspense>
    );
}
