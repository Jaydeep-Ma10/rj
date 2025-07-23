import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";
const Signup = ({ setNotif }) => {
    const [form, setForm] = useState({ name: "", mobile: "", password: "", referralCode: "" });
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
            const res = await api.post("/signup", form);
            login(res.data.user, res.data.token);
            navigate("/");
        }
        catch (err) {
            setNotif?.({ message: err.response?.data?.error || "Signup failed", type: "error" });
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-md w-full bg-white shadow rounded p-6 mx-auto mt-8", children: [_jsx("h2", { className: "text-2xl font-bold mb-4 text-center", children: "Create Account" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("input", { name: "name", placeholder: "Name", value: form.name, onChange: handleChange, className: "w-full border p-2 rounded", required: true }), _jsx("input", { name: "mobile", placeholder: "Mobile (optional)", value: form.mobile, onChange: handleChange, className: "w-full border p-2 rounded" }), _jsx("input", { name: "password", type: "password", placeholder: "Password", value: form.password, onChange: handleChange, className: "w-full border p-2 rounded", required: true }), _jsx("input", { name: "referralCode", placeholder: "Referral Code (optional)", value: form.referralCode, onChange: handleChange, className: "w-full border p-2 rounded" }), _jsx("button", { type: "submit", className: "w-full bg-green-600 text-white py-2 rounded hover:bg-green-700", disabled: loading, children: loading ? "Creating..." : "Sign Up" })] }), _jsxs("p", { className: "mt-4 text-center text-sm", children: ["Already have an account? ", _jsx("span", { className: "text-blue-600 cursor-pointer", onClick: () => navigate("/login"), children: "Login" })] })] }));
};
export default Signup;
