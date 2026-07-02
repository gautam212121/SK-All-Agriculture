'use client';

import React from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFound() {
    return (
        <>
            <Header />
            <div className="container" style={{ padding: '100px 24px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '72px', animation: 'bounce 2s infinite' }}>⚙️</span>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '36px', marginTop: '24px', color: 'var(--text-light)' }}>
                    404 - Spare Part Not Found
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '460px', margin: '16px auto 30px auto', lineHeight: '1.6' }}>
                    We couldn&apos;t find the page or tractor/rotavator component catalog you are looking for. It might have been moved, renamed, or is temporarily out of stock.
                </p>
                <Link href="/" className="btn-accent" style={{ padding: '12px 32px', textDecoration: 'none' }}>
                    ← Back to Storefront Home
                </Link>
            </div>
            <Footer />
        </>
    );
}
