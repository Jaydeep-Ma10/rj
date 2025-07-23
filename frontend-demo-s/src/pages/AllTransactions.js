import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
const AllTransactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!user?.name)
            return;
        setLoading(true);
        setError(null);
        Promise.all([
            fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/deposits`).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch deposits")),
            fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/withdrawals`).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch withdrawals")),
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
    }, [user?.name]);
    return (_jsxs("div", { className: "max-w-2xl mx-auto py-8 px-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-6 text-green-700", children: "All Transactions" }), _jsx("div", { className: "bg-white rounded shadow p-6 overflow-x-auto", children: loading ? (_jsx("div", { className: "text-gray-500", children: "Loading..." })) : error ? (_jsx("div", { className: "text-red-500", children: error })) : transactions.length === 0 ? (_jsx("div", { className: "text-gray-500", children: "No transactions found." })) : (_jsxs("table", { className: "min-w-full mt-2", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2", children: "Type" }), _jsx("th", { className: "px-4 py-2", children: "Amount" }), _jsx("th", { className: "px-4 py-2", children: "Method" }), _jsx("th", { className: "px-4 py-2", children: "Status" }), _jsx("th", { className: "px-4 py-2", children: "Date" })] }) }), _jsx("tbody", { children: transactions.map((tx) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "px-4 py-2 font-bold", children: tx.type }), _jsxs("td", { className: "px-4 py-2", children: ["\u20B9", tx.amount] }), _jsx("td", { className: "px-4 py-2", children: tx.method }), _jsx("td", { className: "px-4 py-2 capitalize", children: tx.status }), _jsx("td", { className: "px-4 py-2", children: new Date(tx.createdAt).toLocaleString() })] }, tx.type + tx.id))) })] })) })] }));
};
export default AllTransactions;
