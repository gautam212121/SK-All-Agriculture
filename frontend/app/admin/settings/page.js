'use client';

import React, { useState } from 'react';

export default function AdminSettings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match.');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/admin/settings/profile', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || 'Profile password updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                alert(data.message || 'Failed to update password.');
            }
        } catch (err) {
            console.error('Error updating password:', err);
            alert('Connection error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <div className="admin-card">
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
                    Administrative Password Control
                </h2>
                <p style={{ color: 'var(--text-gray)', fontSize: '13px', marginBottom: '24px', lineHeight: '1.4' }}>
                    Update the security credentials for the admin panel. Ensure your new password is at least 6 characters long.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password *</label>
                        <input 
                            type="password" 
                            id="currentPassword" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required 
                            className="form-control" 
                            placeholder="••••••••" 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">New Password *</label>
                        <input 
                            type="password" 
                            id="newPassword" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required 
                            minLength="6"
                            className="form-control" 
                            placeholder="••••••••" 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password *</label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                            minLength="6"
                            className="form-control" 
                            placeholder="••••••••" 
                        />
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', padding: '12px 0' }} disabled={submitting}>
                            {submitting ? '⏳ Updating Credentials...' : '🔑 Update Security Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
