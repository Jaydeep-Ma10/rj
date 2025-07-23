import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import api from "../../utils/api";
import AdminWithdrawals from "./AdminWithdrawals";
const AdminDashboard = () => {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("Paytm Pay");
    const [dashboardTab, setDashboardTab] = useState('deposits');
    const paymentMethods = ["Paytm Pay", "PhonePe", "Google Pay", "Others"];
    // Group deposits by method
    const groupedDeposits = paymentMethods.reduce((acc, method) => {
        acc[method] = deposits.filter(d => (d.method || "Others").toLowerCase() === method.toLowerCase());
        return acc;
    }, {});
    groupedDeposits["Others"] = deposits.filter(d => !paymentMethods.slice(0, 3).some(m => (d.method || "").toLowerCase() === m.toLowerCase()));
    useEffect(() => {
        const fetchDeposits = async () => {
            setLoading(true);
            setError("");
            try {
                const token = localStorage.getItem("adminToken");
                const res = await api.get("/admin/deposits", { headers: { Authorization: `Bearer ${token}` } });
                setDeposits(res.data.deposits || []);
            }
            catch (err) {
                setError("Failed to load deposits");
            }
            finally {
                setLoading(false);
            }
        };
        fetchDeposits();
    }, []);
    const handleAction = async (id, action) => {
        try {
            const token = localStorage.getItem("adminToken");
            await api.post(`/admin/deposits/${id}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setDeposits((prev) => prev.map((d) => d.id === id ? { ...d, status: action === "verify" ? "approved" : "rejected" } : d));
        }
        catch {
            alert("Action failed");
        }
    };
    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
    };
    return (_jsxs("div", { className: "max-w-5xl mx-auto mt-10 bg-white p-8 rounded shadow relative", children: [_jsx("button", { onClick: handleLogout, className: "absolute top-6 right-8 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition", title: "Logout", children: "Logout" }), _jsxs("div", { className: "flex gap-4 mb-6", children: [_jsx("button", { className: `px-4 py-2 rounded font-semibold ${dashboardTab === 'deposits' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`, onClick: () => setDashboardTab('deposits'), children: "Deposits" }), _jsx("button", { className: `px-4 py-2 rounded font-semibold ${dashboardTab === 'withdrawals' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`, onClick: () => setDashboardTab('withdrawals'), children: "Withdrawals" })] }), dashboardTab === 'deposits' ? (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Manual Deposit Requests" }), _jsx("div", { className: "flex gap-4 mb-6 border-b", children: paymentMethods.map(method => (_jsxs("button", { className: `px-3 py-1 rounded-t font-semibold border-b-2 ${activeTab === method ? 'border-blue-600 text-blue-700 bg-blue-100' : 'border-transparent text-gray-600 bg-gray-100'}`, onClick: () => setActiveTab(method), children: [method, _jsx("span", { className: "ml-2 inline-block bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full", children: groupedDeposits[method]?.length || 0 })] }, method))) })] })) : (_jsx(AdminWithdrawals, {})), _jsx("div", { className: "flex gap-4 mb-6 border-b", children: paymentMethods.map(method => (_jsxs("button", { className: `relative px-5 py-2 font-semibold border-b-2 transition-all duration-150 ${activeTab === method ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-600'}`, onClick: () => setActiveTab(method), children: [method, _jsx("span", { className: `ml-2 inline-block text-xs rounded-full px-2 py-0.5 ${groupedDeposits[method]?.length ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`, children: groupedDeposits[method]?.length || 0 })] }, method))) }), loading ? _jsx("div", { children: "Loading..." }) : error ? _jsx("div", { className: "text-red-600", children: error }) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50", children: [_jsx("th", { className: "py-2 px-2", children: "User" }), _jsx("th", { className: "py-2 px-2", children: "Amount" }), _jsx("th", { className: "py-2 px-2", children: "UTR" }), _jsx("th", { className: "py-2 px-2", children: "Method" }), _jsx("th", { className: "py-2 px-2", children: "Slip" }), _jsx("th", { className: "py-2 px-2", children: "Date" }), _jsx("th", { className: "py-2 px-2", children: "Status" }), _jsx("th", { className: "py-2 px-2", children: "Actions" })] }) }), _jsx("tbody", { children: (groupedDeposits[activeTab] || []).length === 0 ? (_jsx("tr", { children: _jsxs("td", { colSpan: 8, className: "text-center py-8 text-gray-400", children: ["No requests for ", activeTab, "."] }) })) : (groupedDeposits[activeTab].map(d => (_jsxs("tr", { className: "border-b hover:bg-gray-50 transition", children: [_jsx("td", { className: "py-2 px-2", children: d.name }), _jsxs("td", { className: "py-2 px-2", children: ["\u20B9", d.amount] }), _jsx("td", { className: "py-2 px-2", children: d.utr }), _jsx("td", { className: "py-2 px-2", children: d.method }), _jsx("td", { className: "py-2 px-2", children: d.slipUrl ? _jsx("a", { href: `https://rj-755j.onrender.com${d.slipUrl}`, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 underline", children: "View" }) : "-" }), _jsx("td", { className: "py-2 px-2", children: new Date(d.createdAt).toLocaleString() }), _jsx("td", { className: "py-2 px-2 capitalize", children: d.status }), _jsx("td", { className: "py-2 px-2", children: d.status === "pending" && (_jsxs(_Fragment, { children: [_jsx("button", { className: "bg-green-600 text-white px-2 py-1 rounded mr-2 hover:bg-green-700", onClick: () => handleAction(d.id, "verify"), children: "Approve" }), _jsx("button", { className: "bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700", onClick: () => handleAction(d.id, "reject"), children: "Reject" })] })) })] }, d.id)))) })] }) }))] }));
};
export default AdminDashboard;
