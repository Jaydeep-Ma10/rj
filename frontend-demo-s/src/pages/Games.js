import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Link, Outlet } from "react-router-dom";
// import "../games/wingo/wingo.css";
const Games = () => {
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("div", { style: { display: 'flex', gap: 12, marginBottom: 24 }, children: _jsx(Link, { to: "wingo", children: _jsx("button", { className: "wingo-tab", "aria-label": "Go to Wingo" }) }) }), _jsx(Outlet, {})] }));
};
export default Games;
