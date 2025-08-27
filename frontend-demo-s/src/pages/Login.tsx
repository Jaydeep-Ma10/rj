import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { RiSmartphoneFill, RiErrorWarningFill } from "react-icons/ri";
import { FaLock } from "react-icons/fa";
import { BiSolidLock } from "react-icons/bi";
import { RiCustomerService2Line } from "react-icons/ri";
import { isMobilePhone } from "validator";

interface LoginProps {
  setNotif?: (n: { message: string; type?: "success" | "error" }) => void;
}

interface FormErrors {
  mobile?: string;
  password?: string;
  general?: string;
}

const Login = ({ setNotif }: LoginProps) => {
  const [form, setForm] = useState({ mobile: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    mobile: false,
    password: false,
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.mobile || !isMobilePhone(form.mobile, 'en-IN')) {
      newErrors.mobile = 'Please enter a valid Indian mobile number';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'mobile' ? value.replace(/\D/g, '').slice(0, 10) : value
    }));

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ mobile: true, password: true });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await api.post("/login", {
        mobile: form.mobile,
        password: form.password
      });

      login(res.data.user, res.data.token);
      navigate("/");
      setNotif?.({ message: "Login successful!", type: "success" });
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.error || "Login failed. Please try again.";
      setErrors({ general: errorMsg });
      setNotif?.({ message: errorMsg, type: "error" });
    } finally {
      setIsSubmitting(false);
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
              <div className="bg-[#2B3270] text-center py-3  flex-[1] text-gray-300 rounded-lg">
                +91
              </div>
              <div className="relative flex-[3]">
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  onBlur={() => handleBlur('mobile')}
                  className={`bg-[#2B3270] py-3 w-full text-white rounded-lg px-4 pr-10 border ${
                    errors.mobile && touched.mobile ? 'border-red-500' : 'border-transparent'
                  }`}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  disabled={isSubmitting}
                />
                {errors.mobile && touched.mobile && (
                  <div className="absolute flex right-2 top-1/2 -translate-y-1/2 text-red-500">
                    <RiErrorWarningFill className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
              {errors.mobile && touched.mobile && (
                <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
              )}
          </div>

          <div>
            <div className="flex items-center gap-2 py-4 text-white">
              <FaLock className="w-6 h-6 text-[#5f7beb]" />
              Password
            </div>
            <div className="flex justify-center items-center gap-2">
              <div className="relative w-full">
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  className={`bg-[#2B3270] py-3 w-full text-white rounded-lg px-4 pr-10 border ${
                    errors.password && touched.password ? 'border-red-500' : 'border-transparent'
                  }`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                {errors.password && touched.password && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500">
                    <RiErrorWarningFill className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
          </div>

          <div className="flex justify-center items-center flex-col mt-6 gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 py-3 w-full bg-gradient-to-r from-[#2AAAF3] to-[#2979F2] text-white text-lg font-semibold rounded-3xl ${
                isSubmitting ? 'opacity-75' : 'hover:opacity-90'
              } transition-opacity`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
            {errors.general && (
              <div className="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded-lg">
                {errors.general}
              </div>
            )}
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