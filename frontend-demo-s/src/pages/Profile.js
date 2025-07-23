import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../hooks/useAuth";
const Profile = () => {
    const { user } = useAuth();
    return (_jsxs("div", { className: "max-w-md w-full bg-white shadow rounded p-6 mx-auto mt-8", children: [_jsx("h2", { className: "text-2xl font-bold mb-4 text-center", children: "Profile" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("strong", { children: "Name:" }), " ", user?.name] }), _jsxs("div", { children: [_jsx("strong", { children: "Mobile:" }), " ", user?.mobile || "-"] }), _jsxs("div", { children: [_jsx("strong", { children: "Referral Code:" }), " ", _jsx("span", { className: "font-mono bg-gray-100 px-2 py-1 rounded", children: user?.referralCode })] })] })] }));
};
export default Profile;
