import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
const BetOptions = ({ onSelect }) => {
    const colors = [
        { label: "Green", value: "green", className: "bg-green-500" },
        { label: "Violet", value: "violet", className: "bg-purple-500" },
        { label: "Red", value: "red", className: "bg-red-500" },
    ];
    return (_jsx("div", { className: "grid grid-cols-3 gap-4 mt-4", children: colors.map((btn) => (_jsx("div", { onClick: () => onSelect(btn.value), className: `text-white text-center py-2 rounded-xl text-lg font-semibold shadow-md cursor-pointer transition-transform hover:scale-105 ${btn.className}`, children: btn.label }, btn.value))) }));
};
export default BetOptions;
