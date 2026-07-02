'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import CategoriesBar from '../components/CategoriesBar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

export default function Home() {
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Slider State
    const [currentSlide, setCurrentSlide] = useState(0);

    // Inquiry Form State
    const [inquiryName, setInquiryName] = useState('');
    const [inquiryPhone, setInquiryPhone] = useState('');
    const [inquiryMachine, setInquiryMachine] = useState('');
    const [inquiryMsg, setInquiryMsg] = useState('');
    const [submittingInquiry, setSubmittingInquiry] = useState(false);

    // 1. Fetch Homepage Data
    useEffect(() => {
        async function loadData() {
            try {
                // Fetch Banners
                const bannerRes = await fetch('/api/banners');
                const bannerData = await bannerRes.json();
                if (bannerData.success) {
                    setBanners(bannerData.banners);
                }

                // Fetch Homepage Products/Categories
                const homeRes = await fetch('/api/home');
                const homeData = await homeRes.json();
                if (homeData.success) {
                    setCategories(homeData.categories);
                    setPopularProducts(homeData.popularProducts);
                    setNewArrivals(homeData.newArrivals);
                }
            } catch (err) {
                console.error('Failed to load homepage data:', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // 2. Auto Slide for Hero Carousel
    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners]);

    const handlePrevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    const handleNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    // 3. Submit Technical Inquiry
    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        setSubmittingInquiry(true);

        try {
            const res = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: inquiryName,
                    phone: inquiryPhone,
                    machine: inquiryMachine,
                    message: inquiryMsg
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || 'Inquiry submitted successfully!');
                setInquiryName('');
                setInquiryPhone('');
                setInquiryMachine('');
                setInquiryMsg('');
            } else {
                alert(data.message || 'Failed to submit inquiry.');
            }
        } catch (err) {
            console.error('Inquiry submission error:', err);
            alert('Connection error. Please try again.');
        } finally {
            setSubmittingInquiry(false);
        }
    };

    return (
        <>
            <Header />
            <CategoriesBar />

            {/* 1. Hero Banner Section */}
            <section className="hero" id="hero-slider-section">
                <div className="hero-slider-wrap" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
                    <div 
                        className="hero-slides-container" 
                        style={{ 
                            display: 'flex', 
                            transition: 'transform 0.5s ease-in-out', 
                            transform: `translateX(-${currentSlide * 100}%)`,
                            width: `${Math.max(banners.length, 1) * 100}%`
                        }}
                    >
                        {banners.length === 0 ? (
                            // Default Fallback Slide
                            <div className="hero-slide active" style={{ width: '100%' }}>
                                <div className="container">
                                    <div className="hero-layout">
                                        <div className="hero-content">
                                            <span className="hero-tag">🌾 Professional Agricultural Equipment</span>
                                            <h1 className="hero-title">High-Tensile <span>Rotavator</span> & Tractor Spare Parts</h1>
                                            <p className="hero-desc">Engineered for heavy-duty field operations. Browse our selection of forged yokes, universal joint kits, PTO shafts, and cultivator replacement components.</p>
                                            
                                            <div className="hero-actions">
                                                <Link href="/shop" className="btn-accent">Explore Spare Parts</Link>
                                                <Link href="#categories-section" className="btn-login" style={{ padding: '12px 28px' }}>Browse Categories</Link>
                                            </div>

                                            <div className="hero-badge-grid">
                                                <div className="hero-badge-item">
                                                    <h3>100%</h3>
                                                    <p>Forged Steel</p>
                                                </div>
                                                <div className="hero-badge-item">
                                                    <h3>Free</h3>
                                                    <p>Platform Fee</p>
                                                </div>
                                                <div className="hero-badge-item">
                                                    <h3>COD</h3>
                                                    <p>Cash on Delivery</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="hero-image-container">
                                            <div className="hero-image-glow"></div>
                                            <img src="/uploads/prod-yoke.svg" alt="Premium Rotavator Yoke Forged Shaft" className="hero-image" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            banners.map((banner, index) => (
                                <div key={banner.id} className={`hero-slide ${index === currentSlide ? 'active' : ''}`} style={{ width: `${100 / banners.length}%` }}>
                                    <div className="container">
                                        <div className="hero-layout">
                                            <div className="hero-content">
                                                <span className="hero-tag">🌾 Professional Agricultural Equipment</span>
                                                <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: banner.title }}></h1>
                                                <p className="hero-desc">{banner.subtitle || ''}</p>
                                                
                                                <div className="hero-actions">
                                                    <Link href={banner.link_url || '/shop'} className="btn-accent">Explore Spare Parts</Link>
                                                    <Link href="#categories-section" className="btn-login" style={{ padding: '12px 28px' }}>Browse Categories</Link>
                                                </div>

                                                <div className="hero-badge-grid">
                                                    <div className="hero-badge-item">
                                                        <h3>100%</h3>
                                                        <p>Forged Steel</p>
                                                    </div>
                                                    <div className="hero-badge-item">
                                                        <h3>Free</h3>
                                                        <p>Platform Fee</p>
                                                    </div>
                                                    <div className="hero-badge-item">
                                                        <h3>COD</h3>
                                                        <p>Cash on Delivery</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="hero-image-container">
                                                <div className="hero-image-glow"></div>
                                                <img src={banner.image_url} alt={banner.title} className="hero-image" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Slider Controls */}
                    {banners.length > 1 && (
                        <>
                            <button className="hero-slider-btn prev" onClick={handlePrevSlide} aria-label="Previous Slide" style={{ display: 'flex' }}>&#10094;</button>
                            <button className="hero-slider-btn next" onClick={handleNextSlide} aria-label="Next Slide" style={{ display: 'flex' }}>&#10095;</button>
                            
                            {/* Slider Dots */}
                            <div className="hero-slider-dots" style={{ display: 'flex' }}>
                                {banners.map((_, index) => (
                                    <span 
                                        key={index}
                                        className={`dot ${index === currentSlide ? 'active' : ''}`} 
                                        onClick={() => setCurrentSlide(index)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* 3. Popular Spare Parts */}
            <section className="section-padding">
                <div className="container">
                    <div className="section-title-wrap">
                        <div>
                            <h2 className="section-title">Popular Spare Parts</h2>
                            <p className="section-subtitle">Heavy-duty components high in demand among workshop owners</p>
                        </div>
                        <Link href="/shop?sort=price_desc" style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '14px' }}>Sort by Premium →</Link>
                    </div>

                    <div className="product-grid" id="home-popular-grid">
                        {loading ? (
                            <div style={{ textAlign: 'center', gridColumn: 'span 4', color: 'var(--text-muted)', padding: '40px 0' }}>Loading popular components...</div>
                        ) : popularProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', gridColumn: 'span 4', color: 'var(--text-muted)', padding: '40px 0' }}>No popular parts found.</div>
                        ) : (
                            popularProducts.map(prod => (
                                <ProductCard key={prod.id} product={prod} />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* 4. New Arrivals Spare Parts */}
            <section className="section-padding" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                <div className="container">
                    <div className="section-title-wrap">
                        <div>
                            <h2 className="section-title">New Arrivals</h2>
                            <p className="section-subtitle">Newly cataloged hardware and replacement items for latest models</p>
                        </div>
                        <Link href="/shop?sort=newest" style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '14px' }}>View Newest →</Link>
                    </div>

                    <div className="product-grid" id="home-arrivals-grid">
                        {loading ? (
                            <div style={{ textAlign: 'center', gridColumn: 'span 4', color: 'var(--text-muted)', padding: '40px 0' }}>Loading new arrivals...</div>
                        ) : newArrivals.length === 0 ? (
                            <div style={{ textAlign: 'center', gridColumn: 'span 4', color: 'var(--text-muted)', padding: '40px 0' }}>No new arrivals found.</div>
                        ) : (
                            newArrivals.map(prod => (
                                <ProductCard key={prod.id} product={prod} />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* 5. Why Choose Us Section */}
            <section className="section-padding">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '54px' }}>
                        <h2 className="section-title">Built for Tough Fields</h2>
                        <p className="section-subtitle" style={{ maxWidth: '500px', margin: '8px auto 0 auto' }}>Why farmers and agricultural workshop operators trust SK All Agriculture Parts</p>
                    </div>

                    <div className="why-grid">
                        <div className="why-card">
                            <div className="why-icon">🛡️</div>
                            <h3 className="why-title">Industrial Forged Quality</h3>
                            <p className="why-desc">All universal joints, crosses, and yokes are forged from high-density tempered carbon alloy steel to resist extreme torsional friction.</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon">📍</div>
                            <h3 className="why-title">Farm Location Delivery</h3>
                            <p className="why-desc">Our checkout system captures your precise farm coordinates via GPS, letting us dispatch riders directly to your agricultural site.</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon">💬</div>
                            <h3 className="why-title">Direct WhatsApp Billing</h3>
                            <p className="why-desc">Upon order placement, get a beautifully itemized invoice sent straight to our admin via WhatsApp for rapid verification and dispatch.</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon">💰</div>
                            <h3 className="why-title">Cash on Delivery (COD)</h3>
                            <p className="why-desc">Zero upfront transaction risks. Inspect your replacement gears, clutches, or blade bolts at your doorstep and pay only when satisfied.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Inquiry & Contact Section */}
            <section className="section-padding" id="contact-section" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)' }}>
                <div className="container">
                    <div className="inquiry-wrap">
                        <div className="inquiry-info">
                            <h2>Got a Technical Spare Part Question?</h2>
                            <p>Not sure if a specific PTO joint fits your Swaraj tractor or Maschio rotavator model? Drop us your details, and our agricultural engineer will call you right back.</p>
                            
                            <div className="contact-details">
                                <div className="contact-item">
                                    <div className="contact-icon">📞</div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Direct Call Support</div>
                                        <div style={{ fontWeight: 700, fontSize: '16px' }}>+91 9026754812</div>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon">💬</div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>WhatsApp Inquiry</div>
                                        <div style={{ fontWeight: 700, fontSize: '16px' }}>+91 9026754812</div>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon">📍</div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Store Location</div>
                                        <div style={{ fontWeight: 700, fontSize: '16px' }}>BKT Lucknow, UP, India</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleInquirySubmit} className="inquiry-form">
                            <div className="form-group">
                                <label htmlFor="iq_name">Your Name</label>
                                <input 
                                    type="text" 
                                    id="iq_name" 
                                    value={inquiryName}
                                    onChange={(e) => setInquiryName(e.target.value)}
                                    required 
                                    className="form-control" 
                                    placeholder="Ajeet Gautam" 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="iq_phone">Mobile Number</label>
                                <input 
                                    type="tel" 
                                    id="iq_phone" 
                                    value={inquiryPhone}
                                    onChange={(e) => setInquiryPhone(e.target.value)}
                                    required 
                                    className="form-control" 
                                    placeholder="9026754812" 
                                />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="iq_machine">Compatible Machine / Tractor Model</label>
                                <input 
                                    type="text" 
                                    id="iq_machine" 
                                    value={inquiryMachine}
                                    onChange={(e) => setInquiryMachine(e.target.value)}
                                    className="form-control" 
                                    placeholder="Mahindra 575 DI / Shaktiman Rotavator" 
                                />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="iq_msg">Part Details / Custom Requirements</label>
                                <textarea 
                                    id="iq_msg" 
                                    value={inquiryMsg}
                                    onChange={(e) => setInquiryMsg(e.target.value)}
                                    rows="4" 
                                    required 
                                    className="form-control" 
                                    placeholder="I need a heavy-duty universal joint kit with grease coupling. Please share availability..."
                                />
                            </div>
                            <div className="form-group full-width" style={{ marginTop: '10px' }}>
                                <button type="submit" className="btn-accent" style={{ width: '100%' }} disabled={submittingInquiry}>
                                    {submittingInquiry ? '⏳ Submitting...' : 'Submit Technical Inquiry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
