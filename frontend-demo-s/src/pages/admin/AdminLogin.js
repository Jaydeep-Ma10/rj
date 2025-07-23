import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
const AdminLogin = () => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await api.post("/admin/login", form, { baseURL: "https://rj-755j.onrender.com" });
            localStorage.setItem("adminToken", res.data.token);
            navigate("/admin/dashboard");
        }
        catch (err) {
            setError(err.response?.data?.error || "Login failed");
        }
    };
    return (_jsxs("div", { className: "max-w-sm mx-auto mt-24 bg-white p-8 rounded shadow", children: [_jsx("h2", { className: "text-2xl font-bold mb-6 text-center", children: "Admin Login" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("input", { name: "username", placeholder: "Username", value: form.username, onChange: handleChange, className: "w-full border p-2 rounded", required: true }), _jsx("input", { name: "password", type: "password", placeholder: "Password", value: form.password, onChange: handleChange, className: "w-full border p-2 rounded", required: true }), _jsx("button", { type: "submit", className: "w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800", children: "Login" })] }), error && _jsx("div", { className: "text-red-600 mt-3 text-center", children: error })] }));
};
export default AdminLogin;
