import React, { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { FaWallet } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getSocket } from '../../../utils/socket';

const WalletCard: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch balance, and listen for wallet:refresh event
  const fetchBalance = () => {
    const userIdNum = user?.id ? Number(user.id) : undefined;
    if (!userIdNum) return;
    setLoading(true);
    setError(null);
    fetch(`https://rj-755j.onrender.com/api/user/id/${userIdNum}/balance`)
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
    <div className="bg-[#1e2d5c] p-5 rounded-xl text-white shadow-md flex flex-col items-center">
      {/* Balance + Refresh in center */}
      <div className="flex flex-col items-center mb-2">
        <p className="text-2xl font-bold">
          {loading ? (
            <span className="text-base text-gray-400">Loading...</span>
          ) : error ? (
            <span className="text-base text-red-400">{error}</span>
          ) : (
            `₹${balance !== null ? balance.toFixed(2) : "0.00"}`
          )}
        </p>
        <MdRefresh size={20} className="text-gray-300 cursor-pointer mt-1" onClick={fetchBalance} title="Refresh Balance" />
      </div>

      {/* Icon + Label */}
      <div className="flex items-center gap-2 mb-4">
        <FaWallet size={18} className="text-white" />
        <span className="text-sm text-gray-300">Wallet Balance</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold" onClick={() => navigate('/withdraw')}>
          Withdraw
        </Button>
        <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold" onClick={() => navigate('/deposit')}>
          Deposit
        </Button>
      </div>
    </div>
  );
};

export default WalletCard;
