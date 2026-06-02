import { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function CategoryList({ categories, fetchCategories, setMessage }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ text: 'Category deleted', type: 'success' });
                fetchCategories();
            } else {
                setMessage({ text: data.message || 'Delete failed', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error', type: 'error' });
        }
    };

    const handleEditStart = (cat) => {
        setEditingId(cat._id);
        setEditName(cat.name);
    };

    const handleUpdate = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: editName })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ text: 'Category updated', type: 'success' });
                setEditingId(null);
                fetchCategories();
            } else {
                setMessage({ text: data.message || 'Update failed', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error', type: 'error' });
        }
    };

    return (
        <div className="card list-card">
            <h2>Your Categories</h2>
            <div className="category-list">
                {categories.length > 0 ? (
                    categories.map((cat) => (
                        <div key={cat._id} className="category-item">
                            {editingId === cat._id ? (
                                <div className="edit-mode">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="dashboard-input small"
                                    />
                                    <div className="edit-actions">
                                        <button onClick={() => handleUpdate(cat._id)} className="save-btn">Save</button>
                                        <button onClick={() => setEditingId(null)} className="cancel-btn">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="cat-info">
                                        <span className="cat-name">{cat.name}</span>
                                        <span className="cat-type">{cat.type}</span>
                                    </div>
                                    <div className="cat-actions">
                                        <button onClick={() => handleEditStart(cat)} className="edit-btn">✏️</button>
                                        <button onClick={() => handleDelete(cat._id)} className="delete-btn">🗑️</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="empty-text">No categories found.</p>
                )}
            </div>
        </div>
    );
}
