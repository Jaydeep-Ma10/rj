import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
const Account = () => {
    const { user, logout } = useAuth();
    const [balance, setBalance] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!user?.name)
            return;
        setLoading(true);
        setError(null);
        // Fetch balance
        fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/balance`)
            .then(async (res) => {
            if (!res.ok)
                throw new Error("Failed to fetch balance");
            const data = await res.json();
            setBalance(data.balance);
        })
            .catch((err) => setError(err.message || "Error fetching balance"))
            .finally(() => setLoading(false));
        // Fetch profile (id, lastLogin, etc)
        fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/profile`)
            .then(async (res) => {
            if (!res.ok)
                throw new Error("Failed to fetch profile");
            const data = await res.json();
            setProfile(data.user);
        })
            .catch(() => { });
    }, [user?.name]);
    return (_jsxs("div", { className: "max-w-2xl mx-auto py-8 px-4", children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx("img", { src: user?.avatarUrl
                            ? user.avatarUrl
                            : (() => {
                                // Stable pseudo-random avatar for user
                                let hash = 0;
                                const key = profile?.id || user?.name || '';
                                for (let i = 0; i < key.length; i++)
                                    hash = key.charCodeAt(i) + ((hash << 5) - hash);
                                const gender = Math.abs(hash) % 2 === 0 ? 'men' : 'women';
                                const avatarId = Math.abs(hash) % 99 + 1;
                                return `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
                            })(), alt: "avatar", className: "w-20 h-20 rounded-full object-cover border-4 border-blue-400" }), _jsxs("div", { children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: "text-2xl font-bold text-white bg-blue-900 px-2 rounded", children: user?.name || "MEMBER" }) }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("span", { className: "bg-yellow-400 text-white px-2 py-1 rounded text-xs font-semibold", children: "UID" }), _jsx("span", { className: "text-yellow-300 font-mono text-lg", children: profile?.id || '-' })] })] })] }), _jsxs("div", { className: "bg-blue-900 rounded-lg p-6 text-white mb-6", children: [_jsx("div", { className: "text-lg font-semibold mb-2", children: "Total balance" }), _jsx("div", { className: "text-3xl font-bold mb-2", children: loading ? (_jsx("span", { className: "text-base text-gray-400", children: "Loading..." })) : error ? (_jsx("span", { className: "text-base text-red-400", children: error })) : (`₹${(balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`) }), _jsxs("div", { className: "flex gap-6 justify-center mt-4", children: [_jsxs("a", { href: "/deposit", className: "flex flex-col items-center hover:scale-105 transition", children: [_jsx("div", { className: "bg-orange-500 rounded-full p-3 mb-1", children: "\uD83D\uDCB8" }), _jsx("div", { className: "text-orange-100 font-semibold", children: "Deposit" })] }), _jsxs("a", { href: "/withdraw", className: "flex flex-col items-center hover:scale-105 transition", children: [_jsx("div", { className: "bg-blue-500 rounded-full p-3 mb-1", children: "\uD83C\uDFE7" }), _jsx("div", { className: "text-blue-100 font-semibold", children: "Withdraw" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: "bg-blue-800 rounded-lg p-4 text-white flex flex-col justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: "Game History" }), _jsx("div", { className: "text-xs text-blue-200 mb-2", children: "My game history" })] }), _jsx("div", { className: "text-xs text-blue-100 mt-2", children: "Coming Soon" })] }), _jsxs("a", { href: "/all-transactions", className: "bg-green-800 rounded-lg p-4 text-white flex flex-col justify-between hover:scale-105 transition", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: "Transaction" }), _jsx("div", { className: "text-xs text-green-200 mb-2", children: "My transaction history" })] }), _jsx("div", { className: "text-xs text-green-100 mt-2 underline", children: "View All \u2192" })] }), _jsxs("a", { href: "/deposit-history", className: "bg-pink-800 rounded-lg p-4 text-white flex flex-col justify-between hover:scale-105 transition", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: "Deposit" }), _jsx("div", { className: "text-xs text-pink-200 mb-2", children: "My deposit history" })] }), _jsx("div", { className: "text-xs text-pink-100 mt-2 underline", children: "View Details \u2192" })] }), _jsxs("a", { href: "/withdraw-history", className: "bg-orange-800 rounded-lg p-4 text-white flex flex-col justify-between hover:scale-105 transition", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: "Withdraw" }), _jsx("div", { className: "text-xs text-orange-200 mb-2", children: "My withdraw history" })] }), _jsx("div", { className: "text-xs text-orange-100 mt-2 underline", children: "View Details \u2192" })] })] }), _jsx("button", { onClick: logout, className: "w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition", children: "Logout" })] }));
};
export default Account;
