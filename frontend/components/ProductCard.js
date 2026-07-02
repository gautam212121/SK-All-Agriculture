'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product }) {
    const { setCartCount } = useApp();
    const [adding, setAdding] = useState(false);

    const isDiscount = product.discount_price !== null;
    const badgeText = isDiscount ? 'Offer' : 'Premium';
    const badgeClass = isDiscount ? 'product-badge discount' : 'product-badge';
    const materialLabel = product.material ? product.material.split(' ')[0] : 'Part';

    const handleAddToCart = async (e) => {
        e.preventDefault();
        setAdding(true);

        try {
            const res = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, quantity: 1 })
            });
            const data = await res.json();
            if (data.success) {
                setCartCount(data.cartCount);
                // Trigger a global toast or alert
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

    return (
        <div className="product-card">
            <span className={badgeClass}>{badgeText}</span>
            <Link href={`/product/${product.slug}`} className="product-img-wrap">
                <img src={product.main_image} alt={product.name} />
            </Link>
            <div className="product-info">
                <span className="product-brand">{product.brand}</span>
                <h3 className="product-title">
                    <Link href={`/product/${product.slug}`}>{product.name}</Link>
                </h3>
                <div className="product-meta-row">
                    <span>SKU: {product.sku}</span>
                    <span>{materialLabel}</span>
                </div>
                <div className="product-price-row">
                    {isDiscount ? (
                        <>
                            <span className="product-price">₹{product.discount_price}</span>
                            <span className="product-old-price">₹{product.price}</span>
                        </>
                    ) : (
                        <span className="product-price">₹{product.price}</span>
                    )}
                </div>
                <form onSubmit={handleAddToCart} className="ajax-add-to-cart-form">
                    <button type="submit" className="btn-card-add" disabled={adding}>
                        {adding ? '⏳ Adding...' : '🛒 Add to Cart'}
                    </button>
                </form>
            </div>
        </div>
    );
}
