import React, { useState, useEffect } from "react";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getSocket } from "../../../utils/socket";
import { buildApiUrl, API_ENDPOINTS } from "../../../config/api";
import { MdRefresh } from "react-icons/md";
import { IoWalletSharp } from "react-icons/io5";

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
    fetch(buildApiUrl(API_ENDPOINTS.USER_BALANCE_BY_ID(userIdNum)))
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
    <div className="bg-[#374992] p-3 rounded-xl text-white shadow-md flex flex-col items-center mt-4">
      {/* Balance + Refresh in center */}
      <div className="flex gap-4 items-center mb-2">
        <p className="text-lg font-bold">
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
        <IoWalletSharp size={18} className="text-[#779de7]" />
        <span className="text-sm text-gray-300">Wallet Balance</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-12">
        <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-[3.5px] rounded-full font-semibold" onClick={() => navigate('/withdraw')}>
          Withdraw
        </Button>
        <Button className="bg-[#17B15E] hover:bg-green-600 text-white px-8 py-[3.5px] rounded-full font-semibold" onClick={() => navigate('/deposit')}>
          Deposit
        </Button>
      </div>
    </div>
  );
};

export default WalletCard;
