import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { getSocket } from '../utils/socket';

const Wallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch balance, and listen for wallet:refresh event
  const fetchBalance = () => {
    const userIdNum = user?.id ? Number(user.id) : undefined;
    if (!userIdNum) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/api/user/id/${userIdNum}/balance`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch balance");
        const data = await res.json();
        setBalance(data.balance);
      })
      .catch((err) => setError(err.message || "Error fetching balance"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBalance();
    window.addEventListener('wallet:refresh', fetchBalance);

    // Socket.io: join user room and listen for balanceUpdate
    const socket = getSocket();
    const userIdNum = user?.id ? Number(user.id) : undefined;
    if (userIdNum) {
      socket.emit('join', { room: `user:${userIdNum}` });
    }
    socket.on('balanceUpdate', (data: { userId: number; balance: number }) => {
      if (data.userId === userIdNum) {
        fetchBalance();
      }
    });

    return () => {
      window.removeEventListener('wallet:refresh', fetchBalance);
      socket.off('balanceUpdate');
    };
  }, [user?.name, user?.id]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Wallet</h1>
      <div className="bg-white rounded shadow p-6 mb-6 flex flex-col items-center">
        <span className="text-gray-500">Total balance</span>
        <span className="text-3xl font-bold text-blue-800 mt-1 mb-2">
          {loading ? (
            <span className="text-base text-gray-400">Loading...</span>
          ) : error ? (
            <span className="text-base text-red-400">{error}</span>
          ) : (
            `₹${(balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          )}
        </span>
        <div className="flex gap-4 mt-4">
          <Link to="/deposit">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Deposit</button>
          </Link>
          <Link to="/withdraw">
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Withdraw</button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/deposit-history">
          <div className="bg-green-100 rounded-lg p-4 shadow hover:bg-green-200 cursor-pointer">
            <h2 className="font-semibold text-green-700">Deposit History</h2>
            <p className="text-xs text-green-800">My deposit history</p>
          </div>
        </Link>
        <Link to="/withdraw-history">
          <div className="bg-red-100 rounded-lg p-4 shadow hover:bg-red-200 cursor-pointer">
            <h2 className="font-semibold text-red-700">Withdraw History</h2>
            <p className="text-xs text-red-800">My withdraw history</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Wallet;
