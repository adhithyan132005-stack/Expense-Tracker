import { PieChart, ColumnChart } from 'react-chartkick';
import Chartkick from 'chartkick';
import Chart from 'chart.js/auto';

Chartkick.addAdapter(Chart);

export default function ExpenseCharts({ expenses }) {
    // Process Data for Category Chart
    const categoryData = expenses.reduce((acc, exp) => {
        const catName = exp.category?.name || 'Uncategorized';
        acc[catName] = (acc[catName] || 0) + exp.amount;
        return acc;
    }, {});

    // Process Data for Monthly Chart
    // Sort expenses by date first to ensure chart labels are in order
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));

    const monthData = sortedExpenses.reduce((acc, exp) => {
        const date = new Date(exp.date);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[monthYear] = (acc[monthYear] || 0) + exp.amount;
        return acc;
    }, {});

    return (
        <div className="charts-grid">
            <div className="card chart-card">
                <h3>Expenses by Category</h3>
                <PieChart
                    data={categoryData}
                    donut={true}
                    colors={["#6c63ff", "#34d399", "#f87171", "#fbbf24", "#a78bfa", "#2dd4bf"]}
                    prefix="₹"
                    empty="No data available"
                />
            </div>
            <div className="card chart-card">
                <h3>Expenses by Month</h3>
                <ColumnChart
                    data={monthData}
                    colors={["#6c63ff"]}
                    prefix="₹"
                    empty="No data available"
                    xtitle="Month"
                    ytitle="Amount (₹)"
                />
            </div>
        </div>
    );
}
