import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
const CountdownTimer = ({ duration, timePeriod }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : duration));
        }, 1000);
        return () => clearInterval(timer);
    }, [duration]);
    const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;
    return (_jsxs("div", { className: "bg-[#1e2d5c] p-3 rounded-lg w-full md:w-1/2 text-center shadow-md", children: [_jsx("h2", { className: "text-white text-sm mb-2", children: "\u23F3 Time Remaining" }), _jsx("p", { className: "text-2xl text-yellow-400 font-bold mb-2", children: formatTime(timeLeft) }), _jsx("p", { className: "text-xs text-gray-300", children: "Time Period" }), _jsx("p", { className: "text-white text-sm font-mono", children: timePeriod })] }));
};
export default CountdownTimer;
