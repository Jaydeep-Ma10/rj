import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
const getColor = (num) => {
    if (num === 0)
        return "Red + Violet";
    if (num === 5)
        return "Green + Violet";
    if ([2, 4, 6, 8].includes(num))
        return "Red";
    if ([1, 3, 7, 9].includes(num))
        return "Green";
    return "Unknown";
};
const getBigSmall = (num) => {
    if ([6, 7, 8, 9].includes(num))
        return "Big";
    if ([1, 2, 3, 4].includes(num))
        return "Small";
    return "-";
};
const GameHistoryTable = ({ history }) => {
    return (_jsxs("div", { className: "bg-[#1e2d5c] text-white rounded-xl p-4 mt-4", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\uD83D\uDCDC Game History" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm table-auto", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-[#293b6a] text-white", children: [_jsx("th", { className: "py-2 px-3 text-left", children: "Period" }), _jsx("th", { className: "py-2 px-3 text-left", children: "Number" }), _jsx("th", { className: "py-2 px-3 text-left", children: "Big/Small" }), _jsx("th", { className: "py-2 px-3 text-left", children: "Color" }), _jsx("th", { className: "py-2 px-3 text-left", children: "Status" })] }) }), _jsx("tbody", { children: history.map((item) => (_jsxs("tr", { className: "border-b border-gray-700 hover:bg-[#33416d]", children: [_jsx("td", { className: "py-2 px-3", children: item.period }), _jsx("td", { className: "py-2 px-3 font-bold", children: item.number }), _jsx("td", { className: "py-2 px-3", children: getBigSmall(item.number) }), _jsx("td", { className: "py-2 px-3", children: getColor(item.number) }), _jsx("td", { className: "py-2 px-3", children: item.status === "pending" ? (_jsx("span", { className: "bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold", children: "Ongoing" })) : (_jsx("span", { className: "bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold", children: "Settled" })) })] }, item.id))) })] }) })] }));
};
export default GameHistoryTable;
