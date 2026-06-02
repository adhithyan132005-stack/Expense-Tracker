import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ExpenseCharts from './ExpenseCharts';
import './Dashboard.css';

const API_BASE = 'http://localhost:5000/api';

export default function DashboardHome() {
    const [stats, setStats] = useState({ totalExpenses: 0, categoryCount: 0, recentExpenses: [], allExpenses: [] });
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const token = localStorage.getItem('token');
        try {
            const [expRes, catRes] = await Promise.all([
                fetch(`${API_BASE}/expenses?limit=100`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/categories`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const expData = await expRes.json();
            const catData = await catRes.json();

            if (expData.success && catData.success) {
                const total = expData.expenses.reduce((acc, exp) => acc + exp.amount, 0);
                setStats({
                    totalExpenses: total,
                    categoryCount: catData.categories.length,
                    recentExpenses: expData.expenses.slice(0, 5),
                    allExpenses: expData.expenses
                });
            }
        } catch (err) {
            console.error('Fetch stats error:', err);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <Navbar />
            <main className="dashboard-content">
                <div className="stats-grid">
                    <div className="card stat-card">
                        <h3>Total Spending</h3>
                        <p className="stat-value">₹{stats.totalExpenses}</p>
                    </div>
                    <div className="card stat-card">
                        <h3>Categories</h3>
                        <p className="stat-value">{stats.categoryCount}</p>
                    </div>
                    <div className="card stat-card">
                        <h3>Entries</h3>
                        <p className="stat-value">{stats.recentExpenses.length}</p>
                    </div>
                </div>

                <ExpenseCharts expenses={stats.allExpenses} />

                <div className="card overview-card">
                    <h2>Recent Activity</h2>
                    <div className="recent-list">
                        {stats.recentExpenses.length > 0 ? (
                            stats.recentExpenses.map(exp => (
                                <div key={exp._id} className="recent-item">
                                    <span>{exp.title}</span>
                                    <span className="recent-amount">₹{exp.amount}</span>
                                </div>
                            ))
                        ) : (
                            <p className="empty-text">No recent activity found.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
