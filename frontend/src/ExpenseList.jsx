export default function ExpenseList({ expenses, fetchExpenses, setMessage }) {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="card list-card expenses-list-full">
            <h2>Your Expenses</h2>
            <div className="expense-list">
                {expenses.length > 0 ? (
                    expenses.map((exp) => (
                        <div key={exp._id} className="expense-item">
                            <div className="exp-info">
                                <span className="exp-title">{exp.title}</span>
                                <span className="exp-cat">{exp.category?.name || 'Uncategorized'}</span>
                                <span className="exp-date">{formatDate(exp.date)}</span>
                            </div>
                            <div className="exp-amount">
                                <span className="amount">₹{exp.amount}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="empty-text">No expenses found.</p>
                )}
            </div>
        </div>
    );
}
