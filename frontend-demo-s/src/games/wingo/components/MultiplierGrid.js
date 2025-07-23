import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
const multipliers = [1, 5, 10, 20, 50, 100];
const MultiplierGrid = ({ onSelect }) => {
    const [selected, setSelected] = useState(null);
    const handleClick = (value) => {
        setSelected(value);
        onSelect(value);
    };
    return (_jsxs("div", { className: "grid grid-cols-7 gap-3 mt-6 w-full", children: [_jsx("div", { onClick: () => handleClick("Random"), className: `px-2 py-2 rounded-full text-center font-bold text-sm cursor-pointer shadow-md
          hover:scale-105 transition-transform ${selected === "Random"
                    ? "bg-pink-400 text-black"
                    : "bg-[#1e2d5c] text-white"}`, children: "\uD83C\uDFB2 Random" }), multipliers.map((m) => (_jsxs("div", { onClick: () => handleClick(m), className: `px-2 py-2 rounded-full text-center font-bold text-sm cursor-pointer shadow-md
            hover:scale-105 transition-transform ${selected === m ? "bg-yellow-400 text-black" : "bg-[#1e2d5c] text-white"}`, children: [m, "x"] }, m)))] }));
};
export default MultiplierGrid;
