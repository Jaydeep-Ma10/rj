import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
const DepositHistory = () => {
    const { user } = useAuth();
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!user?.name)
            return;
        setLoading(true);
        setError(null);
        fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/deposits`)
            .then(async (res) => {
            if (!res.ok)
                throw new Error("Failed to fetch deposit history");
            const data = await res.json();
            setDeposits(data.deposits || []);
        })
            .catch((err) => setError(err.message || "Error fetching deposit history"))
            .finally(() => setLoading(false));
    }, [user?.name]);
    return (_jsxs("div", { className: "max-w-2xl mx-auto py-8 px-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-6 text-green-700", children: "Deposit History" }), _jsx("div", { className: "bg-white rounded shadow p-6", children: loading ? (_jsx("div", { className: "text-gray-400", children: "Loading..." })) : error ? (_jsx("div", { className: "text-red-500", children: error })) : deposits.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "No deposits found." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm text-left", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "py-2 px-3 border-b", children: "Amount" }), _jsx("th", { className: "py-2 px-3 border-b", children: "Status" }), _jsx("th", { className: "py-2 px-3 border-b", children: "Date" }), _jsx("th", { className: "py-2 px-3 border-b", children: "UTR" }), _jsx("th", { className: "py-2 px-3 border-b", children: "Method" }), _jsx("th", { className: "py-2 px-3 border-b", children: "Slip" })] }) }), _jsx("tbody", { children: deposits.map((d) => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsxs("td", { className: "py-2 px-3", children: ["\u20B9", d.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })] }), _jsx("td", { className: "py-2 px-3", children: d.status === "approved" ? (_jsx("span", { className: "text-green-600 font-semibold", children: "Approved" })) : d.status === "rejected" ? (_jsx("span", { className: "text-red-600 font-semibold", children: "Rejected" })) : (_jsx("span", { className: "text-yellow-600 font-semibold", children: "Pending" })) }), _jsx("td", { className: "py-2 px-3", children: new Date(d.createdAt).toLocaleString() }), _jsx("td", { className: "py-2 px-3 font-mono", children: d.utr }), _jsx("td", { className: "py-2 px-3", children: d.method || "-" }), _jsx("td", { className: "py-2 px-3", children: d.slipUrl ? (_jsx("a", { href: `https://rj-755j.onrender.com${d.slipUrl}`, target: "_blank", rel: "noopener noreferrer", children: _jsx("img", { src: `https://rj-755j.onrender.com${d.slipUrl}`, alt: "slip", className: "h-10 rounded shadow" }) })) : (_jsx("span", { className: "text-gray-400", children: "-" })) })] }, d.id))) })] }) })) })] }));
};
export default DepositHistory;
