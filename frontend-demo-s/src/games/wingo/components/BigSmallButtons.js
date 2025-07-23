import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
const BigSmallButtons = ({ onSelect }) => {
    const [selected, setSelected] = useState(null);
    const handleSelect = (choice) => {
        setSelected(choice);
        onSelect(choice);
    };
    return (_jsxs("div", { className: "grid grid-cols-2 gap-4 mt-6", children: [_jsx("div", { onClick: () => handleSelect("big"), className: `text-white font-bold text-lg py-3 rounded-full text-center cursor-pointer shadow-md transition-transform hover:scale-105 ${selected === "big" ? "bg-yellow-400 text-black" : "bg-orange-400"}`, children: "BIG" }), _jsx("div", { onClick: () => handleSelect("small"), className: `text-white font-bold text-lg py-3 rounded-full text-center cursor-pointer shadow-md transition-transform hover:scale-105 ${selected === "small" ? "bg-yellow-400 text-black" : "bg-sky-400"}`, children: "SMALL" })] }));
};
export default BigSmallButtons;
