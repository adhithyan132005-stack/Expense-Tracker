import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="dashboard-nav">
            <div className="nav-logo">💸 ExpenseTracker</div>
            <div className="nav-links">
                <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Overview</Link>
                <Link to="/expenses" className={isActive('/expenses') ? 'active' : ''}>Expenses</Link>
                <Link to="/categories" className={isActive('/categories') ? 'active' : ''}>Categories</Link>
            </div>
            <div className="nav-user">
                <span>Welcome, {user?.username || 'User'}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </nav>
    );
}
