import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { getSocket } from '../utils/socket';
const Wallet = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Fetch balance, and listen for wallet:refresh event
    const fetchBalance = () => {
        const userIdNum = user?.id ? Number(user.id) : undefined;
        if (!userIdNum)
            return;
        setLoading(true);
        setError(null);
        fetch(`https://rj-755j.onrender.com/api/user/id/${userIdNum}/balance`)
            .then(async (res) => {
            if (!res.ok)
                throw new Error("Failed to fetch balance");
            const data = await res.json();
            setBalance(data.balance);
        })
            .catch((err) => setError(err.message || "Error fetching balance"))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        fetchBalance();
        window.addEventListener('wallet:refresh', fetchBalance);
        // Socket.io: join user room and listen for balanceUpdate
        const socket = getSocket();
        const userIdNum = user?.id ? Number(user.id) : undefined;
        if (userIdNum) {
            socket.emit('join', { room: `user:${userIdNum}` });
        }
        socket.on('balanceUpdate', (data) => {
            if (data.userId === userIdNum) {
                fetchBalance();
            }
        });
        return () => {
            window.removeEventListener('wallet:refresh', fetchBalance);
            socket.off('balanceUpdate');
        };
    }, [user?.name, user?.id]);
    return (_jsxs("div", { className: "max-w-2xl mx-auto py-8 px-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-6 text-blue-700", children: "Wallet" }), _jsxs("div", { className: "bg-white rounded shadow p-6 mb-6 flex flex-col items-center", children: [_jsx("span", { className: "text-gray-500", children: "Total balance" }), _jsx("span", { className: "text-3xl font-bold text-blue-800 mt-1 mb-2", children: loading ? (_jsx("span", { className: "text-base text-gray-400", children: "Loading..." })) : error ? (_jsx("span", { className: "text-base text-red-400", children: error })) : (`₹${(balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`) }), _jsxs("div", { className: "flex gap-4 mt-4", children: [_jsx(Link, { to: "/deposit", children: _jsx("button", { className: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700", children: "Deposit" }) }), _jsx(Link, { to: "/withdraw", children: _jsx("button", { className: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700", children: "Withdraw" }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Link, { to: "/deposit-history", children: _jsxs("div", { className: "bg-green-100 rounded-lg p-4 shadow hover:bg-green-200 cursor-pointer", children: [_jsx("h2", { className: "font-semibold text-green-700", children: "Deposit History" }), _jsx("p", { className: "text-xs text-green-800", children: "My deposit history" })] }) }), _jsx(Link, { to: "/withdraw-history", children: _jsxs("div", { className: "bg-red-100 rounded-lg p-4 shadow hover:bg-red-200 cursor-pointer", children: [_jsx("h2", { className: "font-semibold text-red-700", children: "Withdraw History" }), _jsx("p", { className: "text-xs text-red-800", children: "My withdraw history" })] }) })] })] }));
};
export default Wallet;
