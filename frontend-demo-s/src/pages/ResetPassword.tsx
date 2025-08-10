import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { RiSmartphoneFill } from "react-icons/ri";
import { FaLock } from "react-icons/fa";
// import { IoIdCard } from "react-icons/io5";
import { BsShieldLockFill } from "react-icons/bs";
// import { IoPersonSharp } from "react-icons/io5";

interface SignupProps {
  setNotif?: (n: { message: string; type?: "success" | "error" }) => void;
}

const ResetPassword = ({ setNotif }: SignupProps) => {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    referralCode: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [policyAgreed, setPolicyAgreed] = useState(false);

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
      setNotif?.({
        message: err.response?.data?.error || "Signup failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex flex-col items-center justify-center w-full text-white px-2 py-3 bg-[#2B3270]">
        {/* Left Icon */}
        <div className=" flex items-center justify-center ">
          <ArrowLeft
            onClick={() => navigate(-1)}
            className="absolute left-2 cursor-pointer"
          />
          {/* Center Title */}
          <h2 className="text-lg font-bold ">Reset Password</h2>
        </div>
        {/* <div className="mt-2 text-xs flex justify-start items-start">
            If you forget your password, please contact customer service
          </div> */}
      </div>
      <div className="flex flex-col justify-start text-white bg-gradient-to-r from-[#2AAAF3] to-[#2979F2] px-5 py-2">
        <span className="font-bold mb-2">Forgot Password</span>
        <span className="text-xs">Please retrieve/change your password through your mobile phone number</span>
      </div>
      <div className="flex flex-col px-6 gap-2">
        <div className="flex justify-center items-center flex-col gap-1 mt-4">
          <RiSmartphoneFill className="w-7 h-7 text-[#5f7beb]" />
          <div className="font-bold text-[#66A9FF] mb-1">Phone reset</div>
          <div className="border-[1px] border-[#66A9FF] w-full" />
        </div>
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
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="bg-[#2B3270] py-2 flex-[3] text-white rounded-lg px-2"
              placeholder="Please Enter the mobile number"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 py-4 text-white">
            <FaLock className="w-6 h-6 text-[#5f7beb]" />
            Set password
          </div>
          <div className="flex justify-center items-center gap-2">
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="bg-[#2B3270] py-2 flex-1 text-white rounded-lg px-2"
              placeholder="Password"
            />
          </div>
        </div>
        {/* <div>
          <div className="flex items-center gap-2 py-4 text-white">
            <FaLock className="w-6 h-6 text-[#5f7beb]" />
            Confirm password
          </div>
          <div className="flex justify-center items-center gap-2">
            <input
              type="text"
              className="bg-[#2B3270] py-2 flex-1 text-white rounded-lg px-2"
              placeholder="Confirm Password"
            />
          </div>
        </div> */}
        <div>
          <div className="flex items-center gap-2 py-4 text-white">
            <BsShieldLockFill className="w-6 h-6 text-[#5f7beb]" />
            Verification code
          </div>
          <div className="flex justify-center items-center gap-0 bg-[#2B3270] flex-1 text-white rounded-lg px-2">
            <input
              type="text"
              name="referralCode"
              placeholder="Please enter the confirmation code"
              value={form.referralCode}
              onChange={handleChange}
              className="bg-[#2B3270] py-2 flex-1 text-white rounded-lg px-2"
            />
            <button className="py-[5px] px-6 rounded-3xl bg-gradient-to-r from-[#2AAAF3] to-[#2979F2]">
                send
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            id="agree"
            className="w-4 h-4 accent-blue-500"
            checked={policyAgreed}
            onChange={() => setPolicyAgreed(!policyAgreed)}
          />
          <label htmlFor="agree" className="text-sm text-gray-300">
            I have read and agreed to the{" "}
            <a
              href="/privacy"
              className="underline text-blue-400 hover:text-blue-300"
            >
              Privacy Agreement
            </a>
          </label>
        </div>
      </div>

      <div className="flex justify-center items-center flex-col mt-6 px-16 gap-4">
        {/* Checkbox with label */}
        <button
          type="submit"
          onClick={handleSubmit}
          className="flex-1 py-2 w-full bg-gradient-to-r from-[#2AAAF3] to-[#2979F2] text-white text-lg font-semibold rounded-3xl disabled:opacity-50"
          disabled={loading || !policyAgreed}
        >
          {loading ? "Reseting..." : "Reset"}
        </button>
      </div>

      {/* <div className="max-w-md w-full bg-white shadow rounded p-6 mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="Mobile (optional)"
            className="w-full border p-2 rounded"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="referralCode"
            placeholder="Referral Code (optional)"
            value={form.referralCode}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div> */}
    </>
  );
};

export default ResetPassword;
