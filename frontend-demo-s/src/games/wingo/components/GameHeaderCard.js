import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import HowToPlayCard from "./HowToPlayCard";
import CountdownTimer from "./CountdownTimer";
const GameHeaderCard = ({ selectedInterval, results, timePeriod, duration, roundLoading, roundError, }) => {
    return (_jsxs("div", { className: "flex flex-col md:flex-row gap-3 mt-4", children: [_jsx(HowToPlayCard, { selectedInterval: selectedInterval, results: results }), roundLoading ? (_jsx("div", { className: "bg-[#1e2d5c] p-3 rounded-lg w-full md:w-1/2 text-center shadow-md flex items-center justify-center min-h-[90px]", children: _jsx("span", { className: "text-yellow-400 font-bold", children: "Loading round..." }) })) : roundError ? (_jsx("div", { className: "bg-[#1e2d5c] p-3 rounded-lg w-full md:w-1/2 text-center shadow-md flex items-center justify-center min-h-[90px]", children: _jsx("span", { className: "text-red-400 font-bold", children: roundError }) })) : (_jsx(CountdownTimer, { duration: duration, timePeriod: timePeriod }))] }));
};
export default GameHeaderCard;
