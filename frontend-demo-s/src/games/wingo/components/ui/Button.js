import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
const Button = ({ variant = "primary", children, className = "", ...props }) => {
    const base = "px-4 py-2 rounded-full font-medium focus:outline-none transition-colors";
    const variants = {
        primary: "bg-green-500 hover:bg-green-600 text-white",
        secondary: "bg-blue-500 hover:bg-blue-600 text-white",
        danger: "bg-red-500 hover:bg-red-600 text-white",
    };
    return (_jsx("button", { className: `${base} ${variants[variant]} ${className}`, ...props, children: children }));
};
export default Button;
