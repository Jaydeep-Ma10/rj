import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
const getColorClass = (num) => {
    if (num === 0)
        return "bg-gradient-to-r from-red-500 to-purple-500 text-white";
    if (num === 5)
        return "bg-gradient-to-r from-green-500 to-purple-500 text-white";
    if ([2, 4, 6, 8].includes(num))
        return "bg-red-500 text-white";
    if ([1, 3, 7, 9].includes(num))
        return "bg-green-500 text-white";
    return "bg-gray-500 text-white";
};
const GameChart = ({ data }) => {
    return (_jsxs("div", { className: "bg-[#1e2d5c] p-4 mt-4 rounded-xl text-white", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\uD83D\uDCCA Recent Results Chart" }), _jsx("div", { className: "flex gap-4 overflow-x-auto pb-2", children: data.map((item) => (_jsxs("div", { className: `flex flex-col items-center justify-center min-w-[60px] rounded-full w-[60px] h-[60px] ${getColorClass(item.number)}`, children: [_jsx("div", { className: "text-xl font-bold", children: item.number }), _jsx("div", { className: "text-[10px] mt-1 opacity-70", children: item.period.slice(-6) })] }, item.id))) })] }));
};
export default GameChart;
