import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_CONFIG } from "../../config/api";
import { ArrowLeft } from "lucide-react";
import { RiSmartphoneFill } from "react-icons/ri";

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
      const res = await axios.post(`${API_CONFIG.BASE_URL}/admin/login`, form);
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <>
      <div className="relative flex flex-col items-center justify-center w-full text-white px-2 py-3 bg-[#2B3270]">
        <div className="flex items-center justify-center">
          <ArrowLeft
            onClick={() => navigate(-1)}
            className="absolute left-2 cursor-pointer"
          />
          <h2 className="text-lg font-bold">Admin Login</h2>
        </div>
      </div>
      <div className="flex flex-col px-6">
        <div className="flex justify-center items-center flex-col gap-1 my-4">
          <RiSmartphoneFill className="w-7 h-7 text-[#5f7beb]" />
          <div className="text-[#66A9FF] mb-1">Username</div>
          <div className="border-[1px] border-[#66A9FF] w-full" />
        </div>
      </div>
      <div className="max-w-sm mx-auto p-8 rounded shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 py-4 text-white">
              <RiSmartphoneFill className="w-7 h-7 text-[#5f7beb]" />
              Phone Number
            </div>
            <div className="flex justify-center items-center gap-2">
              <input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                className={`bg-[#2B3270] py-3 w-full text-white rounded-lg px-4 pr-10 border border-transparent`}
                required
              />
            </div>
          </div>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="bg-[#2B3270] py-3 w-full text-white rounded-lg px-4 pr-10 border border-transparent"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
          >
            Login
          </button>
        </form>
        {error && <div className="text-red-600 mt-3 text-center">{error}</div>}
      </div>
    </>
  );
};

export default AdminLogin;
