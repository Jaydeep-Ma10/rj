import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../hooks/useAuth";
const Referral = () => {
    const { user } = useAuth();
    const referralLink = `${window.location.origin}/signup?ref=${user?.referralCode || ""}`;
    return (_jsxs("div", { className: "max-w-md w-full bg-white shadow rounded p-6 mx-auto mt-8", children: [_jsx("h2", { className: "text-2xl font-bold mb-4 text-center", children: "Referral" }), _jsxs("div", { className: "mb-4", children: [_jsx("strong", { children: "Your Referral Code:" }), _jsx("span", { className: "ml-2 font-mono bg-gray-100 px-2 py-1 rounded", children: user?.referralCode })] }), _jsxs("div", { className: "mb-4", children: [_jsx("strong", { children: "Referral Link:" }), _jsx("span", { className: "ml-2 font-mono bg-gray-100 px-2 py-1 rounded", children: referralLink })] }), _jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700", onClick: () => navigator.clipboard.writeText(referralLink), children: "Copy Referral Link" })] }));
};
export default Referral;
