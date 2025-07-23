import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
const BetModal = ({ isOpen, onClose, selectedOption, roundId, onSuccess, }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [amount, setAmount] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [multiplier] = useState(1);
    const [agree, setAgree] = useState(false);
    const total = amount * quantity * multiplier;
    const presetAmounts = [1, 10, 100, 1000];
    if (!isOpen)
        return null;
    // 🔥 Dynamic color based on selection
    const getBackgroundColor = () => {
        const opt = selectedOption.toLowerCase();
        if (opt.includes("red"))
            return "#ef4444";
        if (opt.includes("green"))
            return "#22c55e";
        if (opt.includes("violet"))
            return "#8b5cf6";
        if (opt.includes("big"))
            return "#f97316";
        if (opt.includes("small"))
            return "#38bdf8";
        if (opt.includes("digit")) {
            const digit = parseInt(opt.replace("digit", "").trim(), 10);
            if ([2, 4, 6, 8].includes(digit))
                return "#ef4444";
            if ([1, 3, 7, 9].includes(digit))
                return "#22c55e";
            if (digit === 0)
                return "linear-gradient(to right, #ef4444 50%, #8b5cf6 50%)";
            if (digit === 5)
                return "linear-gradient(to right, #22c55e 50%, #8b5cf6 50%)";
        }
        return "#1e2d5c"; // default
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "text-white p-6 rounded-xl w-[90%] max-w-md shadow-2xl", style: {
                background: getBackgroundColor(),
                border: "2px solid white",
                boxShadow: "0 0 20px rgba(0,0,0,0.5)",
            }, children: [_jsxs("h2", { className: "text-xl font-bold mb-4 text-center", children: ["Selected: ", selectedOption] }), _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("span", { className: "text-sm font-semibold", children: "Balance" }), _jsx("div", { className: "flex gap-2", children: presetAmounts.map((amt) => (_jsxs("button", { onClick: () => setAmount(amt), className: `px-3 py-1 rounded-md text-sm font-bold ${amt === amount ? "bg-yellow-400 text-black" : "bg-gray-700"}`, children: ["\u20B9", amt] }, amt))) })] }), _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("span", { className: "text-sm font-semibold", children: "Quantity" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setQuantity(Math.max(1, quantity - 1)), className: "bg-gray-600 px-3 py-1 rounded-lg font-bold", children: "-" }), _jsx("span", { className: "text-lg font-bold", children: quantity }), _jsx("button", { onClick: () => setQuantity(quantity + 1), className: "bg-gray-600 px-3 py-1 rounded-lg font-bold", children: "+" })] })] }), _jsx("div", { className: "grid grid-cols-6 gap-3 mt-4 w-full", children: [1, 5, 10, 20, 50, 100].map((m) => (_jsxs("div", { className: "px-2 py-2 rounded-full text-center text-white font-bold text-sm cursor-pointer bg-[#1e2d5c] hover:bg-yellow-400 hover:text-black transition", children: [m, "x"] }, m))) }), _jsxs("div", { className: "flex items-center mt-4", children: [_jsx("input", { type: "checkbox", checked: agree, onChange: () => setAgree(!agree), className: "mr-2" }), _jsx("label", { className: "text-sm", children: "I agree to the pre-sale rules" })] }), _jsxs("div", { className: "flex flex-col gap-3 mt-6", children: [_jsx("button", { className: "w-full py-3 bg-yellow-400 text-black font-bold text-md rounded-full", disabled: !agree || loading || !roundId, onClick: async () => {
                                if (!agree || !user?.id || !roundId)
                                    return;
                                setLoading(true);
                                setError(null);
                                try {
                                    const payload = {
                                        userId: user.id,
                                        roundId,
                                        type: getBetType(selectedOption),
                                        value: getBetValue(selectedOption),
                                        amount: amount * quantity,
                                        multiplier,
                                    };
                                    const res = await fetch("https://rj-755j.onrender.com/api/wingo/bet", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(payload),
                                    });
                                    if (!res.ok) {
                                        const err = await res.json();
                                        throw new Error(err.error || "Failed to place bet");
                                    }
                                    if (onSuccess)
                                        onSuccess();
                                    onClose();
                                }
                                catch (e) {
                                    setError(e.message || "Failed to place bet");
                                }
                                finally {
                                    setLoading(false);
                                }
                            }, children: loading ? "Placing Bet..." : `Bet Placing Amount: ₹${total}` }), _jsx("button", { onClick: onClose, className: "bg-gray-800 text-white py-2 rounded-md font-semibold", children: "Cancel" })] }), error && (_jsx("div", { className: "bg-red-500 text-white p-2 rounded mt-2 text-center font-bold", children: error }))] }) }));
};
// Helper to parse bet type/value from selectedOption
function getBetType(option) {
    const opt = option.toLowerCase();
    if (["red", "green", "violet"].some((c) => opt.includes(c)))
        return "color";
    if (["big", "small"].some((c) => opt.includes(c)))
        return "bigsmall";
    if (opt.includes("digit"))
        return "number";
    if (opt === "random")
        return "random";
    return "unknown";
}
function getBetValue(option) {
    const opt = option.toLowerCase();
    if (["red", "green", "violet"].some((c) => opt.includes(c)))
        return opt;
    if (["big", "small"].some((c) => opt.includes(c)))
        return opt;
    if (opt.includes("digit"))
        return opt.replace("digit", "").trim();
    if (opt === "random")
        return "random";
    return opt;
}
export default BetModal;
