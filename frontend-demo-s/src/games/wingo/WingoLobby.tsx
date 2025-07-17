import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const intervals = [
  { label: "WinGo 30sec", value: "30s" },
  { label: "WinGo 1 Min", value: "1m" },
  { label: "WinGo 3 Min", value: "3m" },
  { label: "WinGo 5 Min", value: "5m" },
];

interface WingoLobbyProps {
  onIntervalChange?: (interval: string) => void;
  onBalanceRefresh?: (balance: number) => void;
  selectedInterval: string;
}

const WingoLobby: React.FC<WingoLobbyProps> = ({ onIntervalChange, onBalanceRefresh, selectedInterval }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchBalance = async () => {
    if (!user?.name) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/balance`);
      if (!res.ok) throw new Error("Failed to fetch balance");
      const data = await res.json();
      setBalance(data.balance);
      if (onBalanceRefresh) onBalanceRefresh(data.balance);
    } catch (err) {
      setError((err as Error).message || "Error fetching balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    // Optionally: poll or subscribe for live updates
  }, [user?.name]);

  // Handle interval change
  const handleIntervalChange = (value: string) => {
    if (onIntervalChange) onIntervalChange(value);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-4">
      {/* Top bar */}
      <div className="flex flex-row items-center justify-between mb-4 px-2">
        <img src="/logo-tiranga.png" alt="Tiranga" className="h-10" />
        <div className="flex flex-row gap-4 items-center">
          <span className="material-icons text-white text-2xl" aria-hidden="true">account_balance_wallet</span>
          <span className="material-icons text-white text-2xl" aria-hidden="true">history</span>
        </div>
      </div>
      {/* Wallet card */}
      <div className="bg-gradient-to-br from-[#3546a3] to-[#24306e] rounded-3xl p-6 flex flex-col items-center shadow-lg mb-4 w-full">
        <div className="flex flex-row items-center gap-2 mb-2 w-full justify-center">
          <span className="text-3xl text-white font-bold">₹{loading ? "..." : (balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <button onClick={fetchBalance} className="ml-2 text-[#3ed0fa] hover:text-blue-400 flex items-center justify-center"><span className="material-icons text-[#3ed0fa]" aria-hidden="true">refresh</span></button>
        </div>
        <div className="flex flex-row items-center gap-2 mb-4 w-full justify-center">
          <span className="material-icons text-[#3ed0fa]" aria-hidden="true">account_balance_wallet</span>
          <span className="text-white text-lg">Wallet balance</span>
        </div>
        <div className="flex flex-row gap-4 w-full justify-center mt-2">
          <Link to="/withdraw"><button className="bg-red-500 text-white font-bold rounded-full px-8 py-2 text-lg shadow hover:bg-red-600">Withdraw</button></Link>
          <Link to="/deposit"><button className="bg-green-500 text-white font-bold rounded-full px-8 py-2 text-lg shadow hover:bg-green-600">Deposit</button></Link>
        </div>
        {error && <div className="text-red-400 mt-2">{error.includes('Unexpected token') ? 'Backend unavailable or wrong URL.' : error}</div>}
      </div>
      {/* Ad/notification */}
      <div className="flex flex-row items-center bg-[#232a5b] rounded-xl px-4 py-2 mb-4 w-full">
        <span className="material-icons text-[#3ed0fa] mr-2" aria-hidden="true">volume_up</span>
        <span className="text-white flex-1 truncate">If your deposit not receive, please send it directly to Tiranga Games Self-service Ce</span>
        <button className="ml-4 bg-[#3ed0fa] text-white font-bold px-4 py-1 rounded-full">Detail</button>
      </div>
      {/* Interval selector */}
      <div className="grid grid-cols-4 gap-4 bg-[#232a5b] rounded-2xl px-4 py-4 w-full">
        {intervals.map((i) => (
          <button
            key={i.value}
            onClick={() => handleIntervalChange(i.value)}
            className={`flex flex-col items-center gap-1 py-2 rounded-2xl font-bold text-base transition-all w-full ${selectedInterval === i.value ? "bg-[#3ed0fa] text-white shadow-lg scale-105" : "bg-transparent text-[#b0b6e6]"}`}
          >
            <span className="material-icons text-3xl mb-1" aria-hidden="true">schedule</span>
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WingoLobby;
