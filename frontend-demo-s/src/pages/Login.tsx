import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { RiSmartphoneFill } from "react-icons/ri";
import { FaLock } from "react-icons/fa";
import { BiSolidLock } from "react-icons/bi";
import { RiCustomerService2Line } from "react-icons/ri";

interface LoginProps {
  setNotif?: (n: { message: string; type?: "success" | "error" }) => void;
}

const Login = ({ setNotif }: LoginProps) => {
  const [form, setForm] = useState({ mobile: "", password: "" });
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
    <>
      <div className="relative flex flex-col items-center justify-center w-full text-white px-2 py-3 bg-[#2B3270]">
        <div className="flex items-center justify-center">
          <ArrowLeft
            onClick={() => navigate(-1)}
            className="absolute left-2 cursor-pointer"
          />
          <h2 className="text-lg font-bold">Login</h2>
        </div>
      </div>

      <div className="flex flex-col px-6">
        <div className="flex justify-center items-center flex-col gap-1 my-4">
          <RiSmartphoneFill className="w-7 h-7 text-[#5f7beb]" />
          <div className="text-[#66A9FF] mb-1">Your Phone</div>
          <div className="border-[1px] border-[#66A9FF] w-full" />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 py-4 text-white">
              <RiSmartphoneFill className="w-7 h-7 text-[#5f7beb]" />
              Phone Number
            </div>
            <div className="flex justify-center items-center gap-2">
              <div className="bg-[#2B3270] text-center py-2 flex-[1] text-gray-300 rounded-lg">
                +91
              </div>
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="bg-[#2B3270] py-2 flex-[3] text-white rounded-lg px-2"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 py-4 text-white">
              <FaLock className="w-6 h-6 text-[#5f7beb]" />
              Password
            </div>
            <div className="flex justify-center items-center gap-2">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="bg-[#2B3270] py-2 flex-1 text-white rounded-lg px-2"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <div className="flex justify-center items-center flex-col mt-6 gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 w-full bg-gradient-to-r from-[#2AAAF3] to-[#2979F2] text-white text-lg font-semibold rounded-3xl"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <button 
              type="button"
              onClick={() => navigate("/signup")} 
              className="flex-1 py-2 w-full border-[1px] border-[#61A9FF] text-[#61A9FF] text-lg font-semibold rounded-3xl"
            >
              Register
            </button>
          </div>
        </form>

        <div className="flex justify-center items-center mt-6 gap-4">
          <button 
            onClick={() => navigate("/reset-password")} 
            className="flex flex-col justify-center items-center flex-1 w-full text-white text-xs font-semibold rounded-md"
          >
            <BiSolidLock className="text-[#5f7beb] w-10 h-10" />
            Forgot Password
          </button>
          <button className="flex flex-col justify-center items-center flex-1 w-full text-white text-xs font-semibold rounded-md">
            <RiCustomerService2Line className="text-[#5f7beb] w-10 h-10" />
            Customer Service
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;