import { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function ExpenseListTable({ expenses, pagination, fetchExpenses, setMessage, categories }) {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/expenses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ text: 'Expense deleted', type: 'success' });
                fetchExpenses(pagination?.page || 1);
            }
        } catch (err) {
            setMessage({ text: 'Error deleting expense', type: 'error' });
        }
    };

    const handleEditStart = (exp) => {
        setEditingId(exp._id);
        setEditData({
            title: exp.title,
            amount: exp.amount,
            category: exp.category?._id || '',
            date: new Date(exp.date).toISOString().split('T')[0]
        });
    };

    const handleUpdate = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/expenses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ text: 'Expense updated', type: 'success' });
                setEditingId(null);
                fetchExpenses(pagination?.page || 1);
            }
        } catch (err) {
            setMessage({ text: 'Error updating expense', type: 'error' });
        }
    };

    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="card table-card">
            <div className="table-header">
                <h2>Expense Records</h2>
                <div className="total-badge">Total: ₹{totalExpense}</div>
            </div>

            <div className="table-responsive">
                <table className="expense-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length > 0 ? (
                            expenses.map((exp) => (
                                <tr key={exp._id}>
                                    {editingId === exp._id ? (
                                        <>
                                            <td><input type="date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} className="table-input" /></td>
                                            <td><input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="table-input" /></td>
                                            <td>
                                                <select value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="table-input">
                                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                                </select>
                                            </td>
                                            <td><input type="number" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} className="table-input" /></td>
                                            <td className="table-actions">
                                                <button onClick={() => handleUpdate(exp._id)} className="save-btn small">Save</button>
                                                <button onClick={() => setEditingId(null)} className="cancel-btn small">X</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{formatDate(exp.date)}</td>
                                            <td>{exp.title}</td>
                                            <td><span className="cat-tag">{exp.category?.name || 'Uncategorized'}</span></td>
                                            <td className="amount-cell">₹{exp.amount}</td>
                                            <td className="table-actions">
                                                <button onClick={() => handleEditStart(exp)} className="action-btn edit">✏️</button>
                                                <button onClick={() => handleDelete(exp._id)} className="action-btn delete">🗑️</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="empty-row">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.pages > 1 && (
                <div className="pagination">
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => fetchExpenses(pagination.page - 1)}
                        className="page-btn"
                    >
                        Previous
                    </button>
                    <span className="page-info">Page {pagination.page} of {pagination.pages}</span>
                    <button
                        disabled={pagination.page === pagination.pages}
                        onClick={() => fetchExpenses(pagination.page + 1)}
                        className="page-btn"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
