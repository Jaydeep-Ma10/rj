import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import "./App.css";
// User pages
import Home from "./pages/Home";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import DepositHistory from "./pages/DepositHistory";
import WithdrawHistory from "./pages/WithdrawHistory";
import AllTransactions from "./pages/AllTransactions";
import Callback from "./pages/Callback";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Referral from "./pages/Referral";
import Games from "./pages/Games";
import Activity from "./pages/Activity";
import Wallet from "./pages/Wallet";
import Account from "./pages/Account";
import Landing from "./pages/Landing";
// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
// Components
import BottomNav from "./components/BottomNav";
import Notification from "./components/Notification";
// Auth
import { AuthProvider, useAuth } from "./hooks/useAuth";
// ✅ Lazy load game component
const WingoGame = lazy(() => import("./games/wingo/WingoGame"));
const AppRoutes = () => {
    const { user } = useAuth();
    const [notif, setNotif] = useState({ message: "" });
    return (_jsxs(_Fragment, { children: [_jsx(Notification, { message: notif.message, type: notif.type, onClose: () => setNotif({ message: "" }) }), _jsxs(BrowserRouter, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/admin/login", element: _jsx(AdminLogin, {}) }), _jsx(Route, { path: "/admin/dashboard", element: _jsx(AdminDashboard, {}) }), user ? (_jsxs(_Fragment, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/activity", element: _jsx(Activity, {}) }), _jsx(Route, { path: "/wallet", element: _jsx(Wallet, {}) }), _jsx(Route, { path: "/account", element: _jsx(Account, {}) }), _jsx(Route, { path: "/deposit", element: _jsx(Deposit, {}) }), _jsx(Route, { path: "/withdraw", element: _jsx(Withdraw, {}) }), _jsx(Route, { path: "/deposit-history", element: _jsx(DepositHistory, {}) }), _jsx(Route, { path: "/withdraw-history", element: _jsx(WithdrawHistory, {}) }), _jsx(Route, { path: "/all-transactions", element: _jsx(AllTransactions, {}) }), _jsx(Route, { path: "/callback", element: _jsx(Callback, {}) }), _jsx(Route, { path: "/profile", element: _jsx(Profile, {}) }), _jsx(Route, { path: "/referral", element: _jsx(Referral, {}) }), _jsx(Route, { path: "/games", element: _jsx(Games, {}), children: _jsx(Route, { path: "wingo", element: _jsx(Suspense, { fallback: _jsx("div", { className: "text-white text-center", children: "Loading Wingo..." }), children: _jsx(WingoGame, {}) }) }) })] })) : (_jsxs(_Fragment, { children: [_jsx(Route, { path: "/*", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, { setNotif: setNotif }) }), _jsx(Route, { path: "/signup", element: _jsx(Signup, { setNotif: setNotif }) })] }))] }), user && _jsx(BottomNav, {})] })] }));
};
function App() {
    return (_jsx(AuthProvider, { children: _jsx(AppRoutes, {}) }));
}
export default App;
