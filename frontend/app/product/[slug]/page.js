'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import { useApp } from '../../../context/AppContext';

export default function ProductDetail({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const slug = params.slug;
    const router = useRouter();
    const { setCartCount } = useApp();

    const [product, setProduct] = useState(null);
    const [extraImages, setExtraImages] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Gallery & Cart states
    const [activeImage, setActiveImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        async function fetchProductDetails() {
            setLoading(true);
            try {
                const res = await fetch(`/api/products/${slug}`);
                if (res.status === 404) {
                    router.push('/404');
                    return;
                }
                const data = await res.json();
                if (data.success) {
                    setProduct(data.product);
                    setExtraImages(data.extraImages || []);
                    setRelatedProducts(data.relatedProducts || []);
                    setActiveImage(data.product.main_image);
                }
            } catch (err) {
                console.error('Error fetching product details:', err);
            } finally {
                setLoading(false);
            }
        }
        if (slug) {
            fetchProductDetails();
        }
    }, [slug, router]);

    const handleAddToCart = async () => {
        if (!product) return;
        setAdding(true);

        try {
            const res = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, quantity })
            });
            const data = await res.json();
            if (data.success) {
                setCartCount(data.cartCount);
                alert(data.message || 'Added to cart!');
            } else {
                alert(data.message || 'Failed to add item.');
            }
        } catch (err) {
            console.error('Add to cart error:', err);
            alert('Connection error. Please try again.');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <h3>Loading spare part details...</h3>
                </div>
                <Footer />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Header />
                <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <h3>Product not found.</h3>
                    <Link href="/shop" className="btn-accent" style={{ display: 'inline-block', marginTop: '20px' }}>
                        Return to Catalog
                    </Link>
                </div>
                <Footer />
            </>
        );
    }

    const isDiscount = product.discount_price !== null;

    return (
        <>
            <Header />

            <div className="container" style={{ padding: '40px 24px 80px 24px' }} id="product-detail-container">
                {/* Breadcrumbs */}
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px' }} id="product-breadcrumbs">
                    <Link href="/">Home</Link> &nbsp;/&nbsp; 
                    <Link href="/shop">Spare Parts</Link> &nbsp;/&nbsp; 
                    <Link href={`/shop?category=${product.category_slug}`} style={{ textTransform: 'capitalize' }}>
                        {product.category_name}
                    </Link> &nbsp;/&nbsp; 
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{product.name}</span>
                </div>

                {/* Product Grid Layout */}
                <div className="detail-layout">
                    
                    {/* IMAGES GALLERY (LEFT) */}
                    <div className="detail-gallery">
                        {/* Main View */}
                        <div className="detail-main-img">
                            <img src={activeImage} alt={product.name} />
                        </div>
                        {/* Thumbnails selection row */}
                        {extraImages.length > 0 && (
                            <div className="detail-thumb-row">
                                <div 
                                    className={`detail-thumb ${activeImage === product.main_image ? 'active' : ''}`}
                                    onClick={() => setActiveImage(product.main_image)}
                                >
                                    <img src={product.main_image} alt="Main Thumb" />
                                </div>
                                {extraImages.map((img, idx) => {
                                    const imgUrl = img.image_url;
                                    return (
                                        <div 
                                            key={img.id} 
                                            className={`detail-thumb ${activeImage === imgUrl ? 'active' : ''}`}
                                            onClick={() => setActiveImage(imgUrl)}
                                        >
                                            <img src={imgUrl} alt={`Angle Thumb ${idx + 1}`} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* PRODUCT INFO & ACTIONS (RIGHT) */}
                    <div className="detail-info">
                        <span className="detail-brand">{product.brand}</span>
                        <h1 className="detail-title">{product.name}</h1>

                        {/* Badges & stock indicator */}
                        <div className="detail-meta-pill-row">
                            <span className="detail-pill">{product.quality_type}</span>
                            <span className="detail-pill">SKU: {product.sku}</span>
                            {product.stock > 0 ? (
                                <span className="detail-pill stock-green">
                                    <span className="status-pulse-dot"></span> In Stock ({product.stock} units)
                                </span>
                            ) : (
                                <span className="detail-pill stock-red">
                                    <span className="status-pulse-dot red"></span> Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Pricing Box */}
                        <div className="detail-price-box">
                            {isDiscount ? (
                                <>
                                    <span className="detail-price">₹{product.discount_price}</span>
                                    <span className="detail-old-price">₹{product.price}</span>
                                    <span className="detail-save-badge">Save ₹{(product.price - product.discount_price).toFixed(0)}</span>
                                </>
                            ) : (
                                <span className="detail-price">₹{product.price}</span>
                            )}
                        </div>

                        {/* Short description */}
                        <p className="detail-desc">
                            {product.short_description || 'High-performance agricultural machine spare part.'}
                        </p>

                        {/* Quantity spinners & Cart Button */}
                        {product.stock > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0', flexWrap: 'wrap' }}>
                                <div className="qty-spinner">
                                    <button 
                                        type="button" 
                                        className="btn-minus"
                                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="number" 
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                                        min="1" 
                                        max={product.stock}
                                        readOnly
                                    />
                                    <button 
                                        type="button" 
                                        className="btn-plus"
                                        onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                                    >
                                        +
                                    </button>
                                </div>
                                <button 
                                    onClick={handleAddToCart}
                                    className="btn-accent" 
                                    style={{ flexGrow: 1, minWidth: '180px', padding: '14px 28px', border: 'none', cursor: 'pointer' }}
                                    disabled={adding}
                                >
                                    {adding ? '⏳ Adding to Cart...' : '🛒 Add to Shopping Cart'}
                                </button>
                            </div>
                        )}

                        {/* Technical Specifications Table */}
                        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '30px', marginTop: '10px' }}>
                            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '16px' }}>Technical Specifications</h3>
                            <table className="detail-specs-table">
                                <tbody>
                                    <tr>
                                        <td className="spec-label">Forged Material</td>
                                        <td className="spec-value">{product.material}</td>
                                    </tr>
                                    <tr>
                                        <td className="spec-label">Net Weight</td>
                                        <td className="spec-value">{product.weight}</td>
                                    </tr>
                                    <tr>
                                        <td className="spec-label">Compatible Model</td>
                                        <td className="spec-value">{product.compatible_model}</td>
                                    </tr>
                                    <tr>
                                        <td className="spec-label">Part Usage / Application</td>
                                        <td className="spec-value">{product.part_usage}</td>
                                    </tr>
                                    <tr>
                                        <td className="spec-label">Standard Quality Grade</td>
                                        <td className="spec-value">{product.quality_type}</td>
                                    </tr>
                                    {product.warranty && (
                                        <tr>
                                            <td className="spec-label">Manufacturer Warranty</td>
                                            <td className="spec-value">{product.warranty}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

                {/* Detailed Description Section */}
                {product.description && (
                    <section style={{ marginTop: '60px', borderTop: '1px solid var(--border-light)', paddingTop: '40px' }}>
                        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', marginBottom: '16px' }}>Product Description</h2>
                        <div style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '15px' }}>
                            <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
                        </div>
                    </section>
                )}

                {/* RELATED PRODUCTS SECTION */}
                {relatedProducts.length > 0 && (
                    <section style={{ marginTop: '80px', borderTop: '1px solid var(--border-light)', paddingTop: '50px' }}>
                        <div className="section-title-wrap">
                            <div>
                                <h2 className="section-title" style={{ fontSize: '28px' }}>Related Spare Parts</h2>
                                <p className="section-subtitle">Often purchased together for rotavator and PTO rebuilds</p>
                            </div>
                        </div>

                        <div className="product-grid">
                            {relatedProducts.map(prod => (
                                <ProductCard key={prod.id} product={prod} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <Footer />
        </>
    );
}
