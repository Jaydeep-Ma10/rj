import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
const Landing = () => {
    const navigate = useNavigate();
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-8 w-full max-w-sm text-center", children: [_jsx("h1", { className: "text-3xl font-bold mb-6 text-blue-700", children: "Welcome to Win Go" }), _jsx("p", { className: "mb-8 text-gray-700", children: "Sign up or log in to play and win!" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("button", { className: "bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold", onClick: () => navigate("/signup"), children: "Signup" }), _jsx("button", { className: "bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold", onClick: () => navigate("/login"), children: "Login" })] })] }) }));
};
export default Landing;
