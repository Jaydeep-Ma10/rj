import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const AdminLogin = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/admin/login", form, { baseURL: "https://rj-755j.onrender.com" });
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-24 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full border p-2 rounded" required />
        <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800">Login</button>
      </form>
      {error && <div className="text-red-600 mt-3 text-center">{error}</div>}
    </div>
  );
};

export default AdminLogin;
