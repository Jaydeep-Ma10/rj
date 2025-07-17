import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";

interface SignupProps {
  setNotif?: (n: { message: string; type?: "success" | "error" }) => void;
}

const Signup = ({ setNotif }: SignupProps) => {
  const [form, setForm] = useState({ name: "", mobile: "", password: "", referralCode: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/signup", form);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err: any) {
      setNotif?.({ message: err.response?.data?.error || "Signup failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white shadow rounded p-6 mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="mobile" placeholder="Mobile (optional)" value={form.mobile} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="referralCode" placeholder="Referral Code (optional)" value={form.referralCode} onChange={handleChange} className="w-full border p-2 rounded" />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/login")}>Login</span>
      </p>
    </div>
  );
};

export default Signup;
