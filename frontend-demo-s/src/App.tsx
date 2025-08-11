// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
// import "./App.css";

// Test error - this should cause a TypeScript error
// const testError: string = 123; // Type 'number' is not assignable to type 'string'

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
// import Landing from "./pages/Landing";
import ResetPassword from "./pages/ResetPassword";

// Admin pagess
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Components
import BottomNav from "./components/BottomNav";
import Notification from "./components/Notification";
import Announcement from "./components/Announcement";
import AllGames from "./components/AllGames";  

// Auth
import { AuthProvider, useAuth } from "./hooks/useAuth";


// ✅ Lazy load game component
const WingoGame = lazy(() => import("./games/wingo/WingoGame"));


const AppRoutes = () => {
  const { user } = useAuth();
  const [notif, setNotif] = useState<{ message: string; type?: "success" | "error" }>({ message: "" });
  
  // 🧪 TEMPORARY: Enable UI testing mode to bypass auth (remove in production)
  const UI_TESTING_MODE = false; // Set to false to enable normal auth flow
  const mockUser = UI_TESTING_MODE ? { id: "test", name: "Test User" } : null;

  return (
    <>
      <Notification message={notif.message} type={notif.type} onClose={() => setNotif({ message: "" })} />
      <BrowserRouter>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* 🧪 TEMPORARY: All routes accessible for UI testing (remove in production) */}
          {UI_TESTING_MODE ? (
            <>
              {/* Always show authenticated routes for UI testing */}
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
              <Route path="/announcement" element={<Announcement />} />

              {/* Games with nested route */}
              <Route path="/games" element={<Games />}>
                <Route path="all/:category" element={<AllGames />} />
                <Route
                  path="wingo"
                  element={
                    <Suspense fallback={<div className="text-white text-center">Loading Wingo...</div>}>
                      <WingoGame />
                    </Suspense>
                  }
                />
              </Route>
              
              {/* Redirect any other path to home for testing */}
              <Route path="/*" element={<Home />} />
            </>
          ) : (
            <>
              {/* Normal auth flow - User Routes */}
              {(user || mockUser) ? (
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
                  <Route path="/announcement" element={<Announcement />} />

                  {/* Games with nested route */}
                  <Route path="/games" element={<Games />}>
                  <Route path="all/:category" element={<AllGames />} />
                    <Route
                      path="wingo"
                      element={
                        <Suspense fallback={<div className="text-white text-center">Loading Wingo...</div>}>
                          <WingoGame />
                        </Suspense>
                      }
                    />
                  </Route>
                </>
              ) : (
                <>
                  {/* Non-authenticated user routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/*" element={<Signup />} />
                  <Route path="/login" element={<Login setNotif={setNotif} />} />
                  <Route path="/signup" element={<Signup setNotif={setNotif} />} />
                  <Route path="/reset-password" element={<ResetPassword /> } />
                </>
              )}
            </>
          )}
        </Routes>

        {/* BottomNav - show in UI testing mode or if logged in */}
        {(UI_TESTING_MODE || user || mockUser) && <BottomNav />}
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
