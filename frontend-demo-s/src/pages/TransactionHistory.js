import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
const TransactionHistory = ({ name }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!name)
            return;
        setLoading(true);
        setError(null);
        Promise.all([
            fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(name)}/deposits`).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch deposits")),
            fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(name)}/withdrawals`).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch withdrawals")),
        ])
            .then(([depositData, withdrawalData]) => {
            const deposits = (depositData.deposits || []).map((d) => ({
                ...d,
                type: "Deposit"
            }));
            const withdrawals = (withdrawalData.withdrawals || []).map((w) => ({
                ...w,
                type: "Withdrawal"
            }));
            const combined = [...deposits, ...withdrawals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setTransactions(combined);
        })
            .catch((err) => setError(typeof err === 'string' ? err : 'Error fetching transaction history'))
            .finally(() => setLoading(false));
    }, [name]);
    return (_jsx("div", { className: "text-xs text-green-100 mt-2 overflow-x-auto", children: loading ? (_jsx("div", { children: "Loading..." })) : error ? (_jsx("div", { className: "text-red-200", children: error })) : transactions.length === 0 ? (_jsx("div", { children: "No transactions found." })) : (_jsxs("table", { className: "min-w-full mt-2", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "px-2 py-1", children: "Type" }), _jsx("th", { className: "px-2 py-1", children: "Amount" }), _jsx("th", { className: "px-2 py-1", children: "Method" }), _jsx("th", { className: "px-2 py-1", children: "Status" }), _jsx("th", { className: "px-2 py-1", children: "Date" })] }) }), _jsx("tbody", { children: transactions.slice(0, 5).map((tx) => (_jsxs("tr", { className: "border-t border-green-700", children: [_jsx("td", { className: "px-2 py-1 font-bold", children: tx.type }), _jsxs("td", { className: "px-2 py-1", children: ["\u20B9", tx.amount] }), _jsx("td", { className: "px-2 py-1", children: tx.method }), _jsx("td", { className: "px-2 py-1 capitalize", children: tx.status }), _jsx("td", { className: "px-2 py-1", children: new Date(tx.createdAt).toLocaleString() })] }, tx.type + tx.id))) })] })) }));
};
export default TransactionHistory;
