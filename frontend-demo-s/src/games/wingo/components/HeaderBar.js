import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/games/wingo/components/HeaderBar.tsx
import { ArrowLeft, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import logo from '../assets/logo.png';
export default function HeaderBar() {
    const navigate = useNavigate();
    return (_jsxs("div", { className: "flex items-center justify-between px-4 py-2 bg-[#1E2A78] text-white", children: [_jsx(ArrowLeft, { onClick: () => navigate(-1), className: "cursor-pointer" }), _jsx(Headphones, { className: "cursor-pointer" })] }));
}
