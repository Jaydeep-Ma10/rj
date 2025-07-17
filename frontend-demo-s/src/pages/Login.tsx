import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";

interface LoginProps {
  setNotif?: (n: { message: string; type?: "success" | "error" }) => void;
}

const Login = ({ setNotif }: LoginProps) => {
  const [form, setForm] = useState({ name: "", password: "" });
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
      const res = await api.post("/login", form);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Login failed";
      if (msg.toLowerCase().includes("not found")) {
        setNotif?.({ message: "Please signup first.", type: "error" });
      } else {
        setNotif?.({ message: msg, type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white shadow rounded p-6 mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full border p-2 rounded" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        New here? <span className="text-green-600 cursor-pointer" onClick={() => navigate("/signup")}>Sign up</span>
      </p>
    </div>
  );
};

export default Login;
