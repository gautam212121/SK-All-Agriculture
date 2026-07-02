'use client';

import React, { useState, useEffect } from 'react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users || []);
            }
        } catch (err) {
            console.error('Error loading admin users:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && users.length === 0) {
        return <div style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Loading customers...</div>;
    }

    return (
        <div className="admin-card">
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
                Customer Registry Accounts
            </h2>
            {users.length === 0 ? (
                <p style={{ color: 'var(--text-gray)', fontStyle: 'italic', fontSize: '14px', padding: '20px 0' }}>No customer accounts registered yet.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Account ID</th>
                                <th>Full Name</th>
                                <th>Email Address</th>
                                <th>WhatsApp Number</th>
                                <th>Registration Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-white)' }}>
                                        #{user.id}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>+91 {user.phone}</td>
                                    <td>{new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
