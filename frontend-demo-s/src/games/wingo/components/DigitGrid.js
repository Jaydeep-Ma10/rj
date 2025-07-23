import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
const DigitGrid = ({ onSelectDigit }) => {
    const digits = Array.from({ length: 10 }, (_, i) => i);
    const getDigitStyle = (digit) => {
        if (digit === 0) {
            return {
                background: "linear-gradient(to right, #ef4444 50%, #8b5cf6 50%)", // red + violet
                borderColor: "#7f1d1d", // dark red border
            };
        }
        else if (digit === 5) {
            return {
                background: "linear-gradient(to right, #22c55e 50%, #8b5cf6 50%)", // green + violet
                borderColor: "#065f46", // dark green border
            };
        }
        else if ([2, 4, 6, 8].includes(digit)) {
            return {
                background: "#ef4444", // red
                borderColor: "#7f1d1d", // dark red
            };
        }
        else if ([1, 3, 7, 9].includes(digit)) {
            return {
                background: "#22c55e", // green
                borderColor: "#065f46", // dark green
            };
        }
        else {
            return {
                background: "#4b5563",
                borderColor: "#1f2937",
            };
        }
    };
    return (_jsx("div", { className: "grid grid-cols-5 gap-4 mt-6", children: digits.map((digit) => {
            const style = getDigitStyle(digit);
            return (_jsx("div", { onClick: () => onSelectDigit(digit), style: {
                    background: style.background,
                    borderColor: style.borderColor,
                }, className: `w-16 h-16 rounded-full border-4 text-white font-bold 
              text-lg flex items-center justify-center cursor-pointer 
              hover:scale-105 transition-transform`, children: digit }, digit));
        }) }));
};
export default DigitGrid;
