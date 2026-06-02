import { useState, useEffect } from 'react';
import CategoryList from './CategoryList';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import './Dashboard.css';

const API_BASE = 'http://localhost:5000/api';

export default function Dashboard() {
    const [categoryName, setCategoryName] = useState('');
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = '/login';
            return;
        }

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user data");
            }
        }

        fetchCategories();
        fetchExpenses();
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

    const fetchExpenses = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/expenses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setExpenses(data.expenses);
            }
        } catch (err) {
            console.error('Fetch expenses error:', err);
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

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="dashboard-wrapper">
            <nav className="dashboard-nav">
                <div className="nav-logo">💸 ExpenseTracker</div>
                <div className="nav-user">
                    <span>Welcome, {user?.username || 'User'}</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <div className="sidebar-section">
                    <div className="card category-card">
                        <h2>Add Category</h2>
                        <form onSubmit={handleAddCategory} className="category-form">
                            <input
                                type="text"
                                placeholder="Category Name"
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
                </div>

                <div className="main-section">
                    <ExpenseForm
                        categories={categories}
                        setMessage={setMessage}
                        fetchExpenses={fetchExpenses}
                    />

                    <ExpenseList
                        expenses={expenses}
                        fetchExpenses={fetchExpenses}
                        setMessage={setMessage}
                    />
                </div>

                {message.text && (
                    <div className={`message-alert fixed-alert ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </main>
        </div>
    );
}
