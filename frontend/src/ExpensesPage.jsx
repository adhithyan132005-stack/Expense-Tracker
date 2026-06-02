import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ExpenseForm from './ExpenseForm';
import ExpenseListTable from './ExpenseListTable';
import './Dashboard.css';

const API_BASE = 'http://localhost:5000/api';

export default function ExpensesPage() {
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchCategories();
        fetchExpenses(1);
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

    const fetchExpenses = async (page = 1) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/expenses?page=${page}&limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setExpenses(data.expenses);
                setPagination(data.pagination);
            }
        } catch (err) {
            console.error('Fetch expenses error:', err);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <Navbar />
            <main className="dashboard-content single-col">
                <ExpenseForm
                    categories={categories}
                    setMessage={setMessage}
                    fetchExpenses={() => fetchExpenses(1)}
                />

                <ExpenseListTable
                    expenses={expenses}
                    pagination={pagination}
                    fetchExpenses={fetchExpenses}
                    setMessage={setMessage}
                    categories={categories}
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
