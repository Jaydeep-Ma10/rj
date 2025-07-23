import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";
const Login = ({ setNotif }) => {
    const [form, setForm] = useState({ name: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/login", form);
            login(res.data.user, res.data.token);
            navigate("/");
        }
        catch (err) {
            const msg = err.response?.data?.error || "Login failed";
            if (msg.toLowerCase().includes("not found")) {
                setNotif?.({ message: "Please signup first.", type: "error" });
            }
            else {
                setNotif?.({ message: msg, type: "error" });
            }
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-md w-full bg-white shadow rounded p-6 mx-auto mt-8", children: [_jsx("h2", { className: "text-2xl font-bold mb-4 text-center", children: "Login" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("input", { name: "name", placeholder: "Name", value: form.name, onChange: handleChange, className: "w-full border p-2 rounded", required: true }), _jsx("input", { name: "password", type: "password", placeholder: "Password", value: form.password, onChange: handleChange, className: "w-full border p-2 rounded", required: true }), _jsx("button", { type: "submit", className: "w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700", disabled: loading, children: loading ? "Logging in..." : "Login" })] }), _jsxs("p", { className: "mt-4 text-center text-sm", children: ["New here? ", _jsx("span", { className: "text-green-600 cursor-pointer", onClick: () => navigate("/signup"), children: "Sign up" })] })] }));
};
export default Login;
