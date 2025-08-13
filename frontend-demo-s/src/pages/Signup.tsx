import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { RiSmartphoneFill, RiErrorWarningFill } from "react-icons/ri";
import { FaLock } from "react-icons/fa";
import { IoIdCard } from "react-icons/io5";
import { IoPersonSharp } from "react-icons/io5";
import { isMobilePhone } from "validator";

interface SignupProps {
  setNotif?: (n: { message: string; type?: "success" | "error" }) => void;
}

const Signup = ({ setNotif }: SignupProps) => {
    const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    referralCode: "",
  });
  
  const [errors, setErrors] = useState<{
    name?: string;
    mobile?: string;
    password?: string;
    general?: string;
  }>({});
  
  const [touched, setTouched] = useState({
    name: false,
    mobile: false,
    password: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [policyAgreed, setPolicyAgreed] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!form.mobile || !isMobilePhone(form.mobile, 'en-IN')) {
      newErrors.mobile = 'Please enter a valid Indian mobile number';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!policyAgreed) {
      newErrors.general = 'You must agree to the Terms & Conditions';
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
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, mobile: true, password: true });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await api.post("/signup", {
        name: form.name.trim(),
        mobile: form.mobile,
        password: form.password,
        ...(form.referralCode && { referralCode: form.referralCode })
      });

      login(res.data.user, res.data.token);
      navigate("/");
      setNotif?.({ message: "Signup successful!", type: "success" });
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMsg = err.response?.data?.error || "Signup failed. Please try again.";
      setErrors({ general: errorMsg });
      setNotif?.({ message: errorMsg, type: "error" });
    } finally {
      setIsSubmitting(false);
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
          <h2 className="text-lg font-bold ">Register</h2>
        </div>
        {/* <div className="mt-2 text-xs flex justify-start items-start">
            If you forget your password, please contact customer service
          </div> */}
      </div>
      <div className="flex flex-col px-6 gap-2">
        <div className="flex justify-center items-center flex-col gap-1 mt-4">
          <RiSmartphoneFill className="w-7 h-7 text-[#5f7beb]" />
          <div className="text-[#66A9FF] mb-1">Register Your Phone</div>
          <div className="border-[1px] border-[#66A9FF] w-full" />
        </div>
        <div>
          <div className="flex items-center gap-2 py-4 text-white">
            <IoPersonSharp className="w-7 h-7 text-[#5f7beb]" />
            Name
          </div>
          <div className="relative">
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              className={`bg-[#2B3270] py-3 w-full text-white rounded-lg px-4 border ${
                errors.name && touched.name ? 'border-red-500 pr-10' : 'border-transparent'
              }`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {errors.name && touched.name && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500">
                <RiErrorWarningFill className="w-5 h-5" />
              </div>
            )}
            {errors.name && touched.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 py-4 text-white">
            <RiSmartphoneFill className="w-7 h-7 text-[#5f7beb]" />
            Phone Number
          </div>
          <div className="relative">
            <div className="flex items-center">
              <div className="bg-[#2B3270] text-center py-3 px-4 text-gray-300 rounded-l-lg border border-r-0 border-transparent">
                +91
              </div>
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                onBlur={() => handleBlur('mobile')}
                className={`bg-[#2B3270] py-3 flex-1 text-white rounded-r-lg px-4 border ${
                  errors.mobile && touched.mobile ? 'border-red-500 pr-10' : 'border-transparent'
                }`}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]{10}"
                disabled={isSubmitting}
              />
            </div>
            {errors.mobile && touched.mobile && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500">
                <RiErrorWarningFill className="w-5 h-5" />
              </div>
            )}
            {errors.mobile && touched.mobile && (
              <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 py-4 text-white">
            <FaLock className="w-5 h-5 text-[#5f7beb]" />
            Password
          </div>
          <div className="relative">
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              className={`bg-[#2B3270] py-3 w-full text-white rounded-lg px-4 border ${
                errors.password && touched.password ? 'border-red-500 pr-10' : 'border-transparent'
              }`}
              placeholder="Enter a strong password (min 8 characters)"
              disabled={isSubmitting}
            />
            {errors.password && touched.password && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500">
                <RiErrorWarningFill className="w-5 h-5" />
              </div>
            )}
            {errors.password && touched.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 py-4 text-white">
            <IoIdCard className="w-6 h-6 text-[#5f7beb]" />
            Referral code
          </div>
          <div className="flex justify-center items-center gap-2">
            <input
              type="text"
              name="referralCode"
              placeholder="Referral Code (optional)"
              value={form.referralCode}
              onChange={handleChange}
              className="bg-[#2B3270] py-2 flex-1 text-white rounded-lg px-2"
            />
          </div>
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="policy"
            checked={policyAgreed}
            onChange={(e) => {
              setPolicyAgreed(e.target.checked);
              if (errors.general && e.target.checked) {
                setErrors(prev => ({ ...prev, general: undefined }));
              }
            }}
            className="w-4 h-4 rounded mt-1 flex-shrink-0"
            disabled={isSubmitting}
          />
          <label htmlFor="policy" className="text-xs">
            I agree to the Terms & Conditions
          </label>
        </div>
        {errors.general && (
          <p className="text-red-500 text-xs mt-1">{errors.general}</p>
        )}
      </div>

      <div className="flex justify-center items-center flex-col mt-6 px-16 gap-4">
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-[#5f7beb] text-white py-3 rounded-lg mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
          disabled={!policyAgreed || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex-1 py-2 w-full border-[1px] border-[#61A9FF] text-[#61A9FF] text-lg font-semibold rounded-3xl"
        >
          <span className="text-gray-400 text-sm mr-2">I have an account</span>
          Login
        </button>
      </div>
    </>
  );
};

export default Signup;
