import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import CategoryList from './CategoryList';
import './Dashboard.css';

const API_BASE = 'http://localhost:5000/api';

export default function CategoriesPage() {
    const [categoryName, setCategoryName] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (err) {
            console.error('Fetch categories error:', err);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: categoryName })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ text: 'Category added!', type: 'success' });
                setCategoryName('');
                fetchCategories();
            } else {
                setMessage({ text: data.message || 'Failed to add category', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error', type: 'error' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <Navbar />
            <main className="dashboard-content single-col">
                <div className="card category-card full-width">
                    <h2>Add New Category</h2>
                    <form onSubmit={handleAddCategory} className="category-form horizontal">
                        <input
                            type="text"
                            placeholder="Category Name (e.g. Food, Travel, Rent)"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="dashboard-input"
                        />
                        <button type="submit" className="add-btn" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Category'}
                        </button>
                    </form>
                </div>

                <CategoryList
                    categories={categories}
                    fetchCategories={fetchCategories}
                    setMessage={setMessage}
                />

                {message.text && (
                    <div className={`message-alert fixed-alert ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </main>
        </div>
    );
}
