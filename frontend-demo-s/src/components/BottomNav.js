import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
const navItems = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/activity", label: "Activity", icon: "📊" },
    { to: "/wallet", label: "Wallet", icon: "💰" },
    { to: "/account", label: "Account", icon: "👤" },
];
const BottomNav = () => (_jsx("nav", { className: "fixed bottom-0 left-0 right-0 bg-white border-t shadow flex justify-around z-50 h-77", children: navItems.map((item) => (_jsxs(NavLink, { to: item.to, className: ({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold transition text-gray-700 ${isActive ? "text-blue-600" : "hover:text-blue-500"}`, children: [_jsx("span", { className: "text-2xl mb-1", children: item.icon }), item.label] }, item.to))) }));
export default BottomNav;
