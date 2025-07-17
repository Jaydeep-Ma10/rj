// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
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
import WingoGame from "./games/wingo/WingoGame";
import Activity from "./pages/Activity";
import Wallet from "./pages/Wallet";
import Account from "./pages/Account";
import Landing from "./pages/Landing";

import BottomNav from "./components/BottomNav";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useState } from "react";
import Notification from "./components/Notification";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

const AppRoutes = () => {
  const { user } = useAuth();
  const [notif, setNotif] = useState<{ message: string; type?: "success" | "error" }>({ message: "" });

  return (
    <>
      <Notification message={notif.message} type={notif.type} onClose={() => setNotif({ message: "" })} />
      <BrowserRouter>
        <Routes>
          {/* Admin routes always available */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* User routes (conditional rendering for user state) */}
          {user ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/account" element={<Account />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/deposit-history" element={<DepositHistory />} />
              <Route path="/withdraw-history" element={<WithdrawHistory />} />
              <Route path="/all-transactions" element={<AllTransactions />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/games" element={<Games />}>
                <Route path="wingo" element={<WingoGame />} />
              </Route>
            </>
          ) : (
            <>
              <Route path="/*" element={<Landing />} />
              <Route path="/login" element={<Login setNotif={setNotif} />} />
              <Route path="/signup" element={<Signup setNotif={setNotif} />} />
            </>
          )}
        </Routes>
        {user && <BottomNav />}
      </BrowserRouter>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
