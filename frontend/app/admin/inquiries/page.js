'use client';

import React, { useState, useEffect } from 'react';

export default function AdminInquiries() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInquiries();
    }, []);

    const loadInquiries = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/inquiries', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setInquiries(data.inquiries || []);
            }
        } catch (err) {
            console.error('Error loading inquiries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (inquiryId) => {
        if (!confirm('Are you sure you want to delete this technical inquiry?')) return;
        try {
            const res = await fetch(`/api/admin/inquiries/delete/${inquiryId}`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || 'Inquiry deleted.');
                loadInquiries();
            } else {
                alert(data.message || 'Failed to delete inquiry.');
            }
        } catch (err) {
            console.error('Error deleting inquiry:', err);
        }
    };

    if (loading && inquiries.length === 0) {
        return <div style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Loading inquiries...</div>;
    }

    return (
        <div className="admin-card">
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
                Technical Inquiries Log
            </h2>
            {inquiries.length === 0 ? (
                <p style={{ color: 'var(--text-gray)', fontStyle: 'italic', fontSize: '14px', padding: '20px 0' }}>No inquiries received yet.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Customer Name</th>
                                <th>WhatsApp / Mobile</th>
                                <th>Tractor / Machine Model</th>
                                <th>Part Requirement Message</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.map(iq => (
                                <tr key={iq.id}>
                                    <td>{new Date(iq.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>{iq.name}</td>
                                    <td style={{ fontWeight: '600' }}>
                                        <a 
                                            href={`https://wa.me/91${iq.phone}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                                        >
                                            +91 {iq.phone} 💬
                                        </a>
                                    </td>
                                    <td style={{ fontSize: '13px', color: 'var(--accent)' }}>{iq.machine || '-'}</td>
                                    <td style={{ fontSize: '13px', color: 'var(--text-gray)', maxWidth: '300px', whiteSpace: 'pre-line' }}>{iq.message}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(iq.id)} className="admin-btn admin-btn-danger" style={{ padding: '4px 10px', fontSize: '11px' }}>
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
