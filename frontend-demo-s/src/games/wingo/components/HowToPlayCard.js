import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
const HowToPlayCard = ({ selectedInterval, results }) => {
    // Extract only time part (e.g., "30sec" from "WinGo 30sec")
    const displayInterval = selectedInterval.replace("WinGo", "").trim();
    return (_jsxs("div", { className: "bg-[#1e2d5c] p-4 rounded-xl w-full md:w-1/2 shadow-md", children: [_jsx("h2", { className: "text-white font-semibold text-base mb-3", children: "\uD83D\uDCCC How to Play" }), _jsxs("p", { className: "text-sm text-gray-300 mb-2", children: ["Current Interval:", " ", _jsx("span", { className: "text-yellow-300 font-medium", children: displayInterval })] }), _jsx("h3", { className: "text-sm text-white mb-2 font-medium", children: "\uD83D\uDFE2 Last 5 Winning Numbers:" }), _jsx("div", { className: "flex gap-4", children: results.map((num, index) => (_jsx("div", { className: "w-8 h-8 flex items-center justify-center rounded-full border border-white text-sm font-semibold bg-black text-white", children: num }, index))) })] }));
};
export default HowToPlayCard;
