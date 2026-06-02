import { useState, useRef } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function ExpenseForm({ categories, setMessage, fetchExpenses }) {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        const uploadData = new FormData();
        uploadData.append('file', file);

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/expenses/extract`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadData
            });
            const data = await res.json();

            if (data.success && data.data) {
                const extracted = data.data;
                setFormData((prev) => ({
                    ...prev,
                    title: extracted.title || prev.title,
                    amount: extracted.amount || prev.amount,
                    date: extracted.date || prev.date
                }));
                setMessage({ text: 'Information extracted successfully!', type: 'success' });
            } else {
                setMessage({ text: data.message || 'Failed to extract information', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Extraction error', type: 'error' });
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount || !formData.category) {
            return setMessage({ text: 'Please fill all required fields', type: 'error' });
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ text: 'Expense added!', type: 'success' });
                setFormData({
                    title: '',
                    amount: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                    description: ''
                });
                fetchExpenses();
            } else {
                setMessage({ text: data.message || 'Failed to add expense', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error', type: 'error' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    return (
        <div className="card expense-card">
            <h2>Add Expense</h2>

            <div className="upload-section">
                <span>Quick Fill from File (Image/CSV/JSON):</span>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="file-input"
                    id="expense-file"
                    accept="image/*,.csv,.json,.txt"
                />
                <label htmlFor="expense-file" className="file-label">
                    {loading ? '🔍 Extracting...' : '📂 Upload Bill'}
                </label>
            </div>

            <form onSubmit={handleSubmit} className="expense-form">
                <div className="form-group">
                    <input
                        type="text"
                        name="title"
                        placeholder="Expense Title"
                        value={formData.title}
                        onChange={handleChange}
                        className="dashboard-input"
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className="dashboard-input"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="dashboard-input"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="dashboard-input"
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="add-btn" disabled={loading}>
                    {loading ? 'Processing...' : '🚀 Save Expense'}
                </button>
            </form>
        </div>
    );
}
