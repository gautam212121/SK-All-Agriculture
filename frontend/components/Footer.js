import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="container" style={{ marginTop: 'auto' }}>
            <div className="footer-grid">
                {/* Brand Info */}
                <div className="footer-about">
                    <Link href="/" className="logo-container">
                        <img src="/images/logo.png" alt="SK All Agriculture Parts Logo" className="logo-img" />
                        <span className="logo-text" style={{ color: 'var(--text-light)' }}>SK All Agriculture Parts</span>
                    </Link>
                    <p>High-end, premium quality replacement spare parts for rotavators, tractors, and agricultural machinery. Engineered for durability, strength, and field performance.</p>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-gold)', marginTop: '10px' }}>
                        📞 Support: +91 9026754812
                    </div>
                </div>

                {/* Spare Parts Links */}
                <div>
                    <h3 className="footer-title">Spare Parts</h3>
                    <ul className="footer-links">
                        <li><Link href="/shop?category=rotavator-yoke">Rotavator Yokes</Link></li>
                        <li><Link href="/shop?category=universal-joint">Universal Joints</Link></li>
                        <li><Link href="/shop?category=pto-shaft-parts">PTO Shaft Parts</Link></li>
                        <li><Link href="/shop?category=blade-holder">Blade Holders</Link></li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="footer-title">Quick Links</h3>
                    <ul className="footer-links">
                        <li><Link href="/shop">Browse Catalog</Link></li>
                        <li><Link href="/cart">Shopping Cart</Link></li>
                        <li><Link href="/profile">My Profile</Link></li>
                        <li><Link href="/login?admin=true">Admin Panel</Link></li>
                    </ul>
                </div>

                {/* Location / Address */}
                <div>
                    <h3 className="footer-title">Our Store</h3>
                    <ul className="footer-links" style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li>📍 BKT Lucknow, Uttar Pradesh, India</li>
                        <li>🕒 Mon - Sat: 9:00 AM - 7:00 PM</li>
                        <li>📧 sales@skallagricultureparts.com</li>
                        <li style={{ marginTop: '10px' }}>
                            <span className="status-badge delivered" style={{ fontSize: '11px' }}>COD ONLY</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} SK All Agriculture Parts. All Rights Reserved.</p>
                <p>Designed for Farmers & Workshops</p>
            </div>
        </footer>
    );
}
