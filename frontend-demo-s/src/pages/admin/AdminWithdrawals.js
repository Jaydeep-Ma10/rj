import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import api from "../../utils/api";
const AdminWithdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        const fetchWithdrawals = async () => {
            setLoading(true);
            setError("");
            try {
                const token = localStorage.getItem("adminToken");
                const res = await api.get("/admin/withdrawals", { headers: { Authorization: `Bearer ${token}` } });
                setWithdrawals(res.data.withdrawals || []);
            }
            catch (err) {
                setError("Failed to load withdrawals");
            }
            finally {
                setLoading(false);
            }
        };
        fetchWithdrawals();
    }, []);
    const handleAction = async (id, action) => {
        try {
            const token = localStorage.getItem("adminToken");
            await api.post(`/admin/withdrawals/${id}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setWithdrawals((prev) => prev.map((w) => w.id === id ? { ...w, status: action === "verify" ? "approved" : "rejected" } : w));
        }
        catch {
            alert("Action failed");
        }
    };
    return (_jsxs("div", { className: "max-w-5xl mx-auto mt-10 bg-white p-8 rounded shadow relative", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Manual Withdrawal Requests" }), loading ? (_jsx("div", { className: "text-gray-500", children: "Loading..." })) : error ? (_jsx("div", { className: "text-red-500", children: error })) : withdrawals.length === 0 ? (_jsx("div", { className: "text-gray-500", children: "No withdrawal requests found." })) : (_jsxs("table", { className: "min-w-full mt-4", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2", children: "ID" }), _jsx("th", { className: "px-4 py-2", children: "User" }), _jsx("th", { className: "px-4 py-2", children: "Amount" }), _jsx("th", { className: "px-4 py-2", children: "Method" }), _jsx("th", { className: "px-4 py-2", children: "Status" }), _jsx("th", { className: "px-4 py-2", children: "Actions" })] }) }), _jsx("tbody", { children: withdrawals.map((w) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "px-4 py-2", children: w.id }), _jsx("td", { className: "px-4 py-2", children: w.name || w.userId }), _jsxs("td", { className: "px-4 py-2", children: ["\u20B9", w.amount] }), _jsx("td", { className: "px-4 py-2", children: w.method }), _jsx("td", { className: "px-4 py-2 capitalize", children: w.status }), _jsx("td", { className: "px-4 py-2 flex gap-2", children: w.status === "pending" && (_jsxs(_Fragment, { children: [_jsx("button", { className: "bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700", onClick: () => handleAction(w.id, "verify"), children: "Approve" }), _jsx("button", { className: "bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700", onClick: () => handleAction(w.id, "reject"), children: "Reject" })] })) })] }, w.id))) })] }))] }));
};
export default AdminWithdrawals;
