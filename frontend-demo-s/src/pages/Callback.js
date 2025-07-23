import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Callback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const Callback = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 2000); // Redirect to home after 2 sec
        return () => clearTimeout(timer);
    }, []);
    return (_jsxs("div", { className: "text-center mt-20", children: [_jsx("h1", { className: "text-3xl font-bold text-green-600", children: "\u2705 Payment Successful" }), _jsx("p", { className: "text-lg mt-2", children: "Redirecting to your wallet..." })] }));
};
export default Callback;
