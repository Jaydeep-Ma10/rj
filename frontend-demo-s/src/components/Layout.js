import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-gray-50", children: [_jsxs("nav", { className: "flex items-center justify-between px-4 py-3 bg-white shadow", children: [_jsx("div", { className: "flex items-center gap-4", children: _jsx(Link, { to: "/", className: "text-xl font-bold text-blue-700", children: "Win Go" }) }), _jsx("div", { className: "flex items-center gap-2", children: user ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-gray-700 font-medium", children: user.name }), _jsx("button", { className: "ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm", onClick: () => navigate("/profile"), children: "Profile" }), _jsx("button", { className: "ml-1 px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm", onClick: logout, children: "Logout" })] })) : (_jsxs(_Fragment, { children: [_jsx("button", { className: "px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm", onClick: () => navigate("/login"), children: "Login" }), _jsx("button", { className: "ml-2 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm", onClick: () => navigate("/signup"), children: "Signup" })] })) })] }), _jsx("main", { className: "flex-1 flex flex-col items-center justify-center p-4", children: children })] }));
};
export default Layout;
