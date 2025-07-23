import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
const Notification = ({ message, type = "success", onClose }) => {
    if (!message)
        return null;
    return (_jsx("div", { className: `fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white ${type === "error" ? "bg-red-600" : "bg-green-600"}`, children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { children: message }), _jsx("button", { className: "ml-4 font-bold", onClick: onClose, children: "\u00D7" })] }) }));
};
export default Notification;
