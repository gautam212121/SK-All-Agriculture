'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CategoriesBar() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBar, setShowBar] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch('/api/home');
                const data = await res.json();
                if (data.success && data.categories) {
                    setCategories(data.categories);
                    setShowBar(data.categories.length > 0);
                }
            } catch (err) {
                console.error('Failed to load categories:', err);
            } finally {
                setLoading(false);
            }
        }
        loadCategories();
    }, []);

    const handleCategoryClick = (slug) => {
        router.push(`/shop?category=${slug}`);
    };

    if (loading || !showBar) return null;

    return (
        <section className="categories-showcase">
            <div className="categories-scroll-wrapper">
                <div className="categories-horizontal-scroll">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className="category-showcase-card"
                            onClick={() => handleCategoryClick(cat.slug)}
                            title={cat.name}
                        >
                            <div className="category-showcase-image">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} />
                                ) : (
                                    <div className="category-placeholder">📦</div>
                                )}
                            </div>
                            <span className="category-showcase-name">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
