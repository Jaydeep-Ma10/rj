import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
const WithdrawHistory = () => {
    const { user } = useAuth();
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!user?.name)
            return;
        setLoading(true);
        setError(null);
        fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/withdrawals`)
            .then(async (res) => {
            if (!res.ok)
                throw new Error("Failed to fetch withdrawal history");
            const data = await res.json();
            setWithdrawals(data.withdrawals || []);
        })
            .catch((err) => setError(err.message || "Error fetching withdrawal history"))
            .finally(() => setLoading(false));
    }, [user?.name]);
    return (_jsxs("div", { className: "max-w-2xl mx-auto py-8 px-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-6 text-red-700", children: "Withdraw History" }), _jsx("div", { className: "bg-white rounded shadow p-6", children: loading ? (_jsx("div", { className: "text-gray-500", children: "Loading..." })) : error ? (_jsx("div", { className: "text-red-500", children: error })) : withdrawals.length === 0 ? (_jsx("div", { className: "text-gray-500", children: "No withdrawals found." })) : (_jsxs("table", { className: "min-w-full mt-2", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2", children: "Amount" }), _jsx("th", { className: "px-4 py-2", children: "Method" }), _jsx("th", { className: "px-4 py-2", children: "Status" }), _jsx("th", { className: "px-4 py-2", children: "Date" })] }) }), _jsx("tbody", { children: withdrawals.map((w) => (_jsxs("tr", { className: "border-t", children: [_jsxs("td", { className: "px-4 py-2", children: ["\u20B9", w.amount] }), _jsx("td", { className: "px-4 py-2", children: w.method }), _jsx("td", { className: "px-4 py-2 capitalize", children: w.status }), _jsx("td", { className: "px-4 py-2", children: new Date(w.createdAt).toLocaleString() })] }, w.id))) })] })) })] }));
};
export default WithdrawHistory;
