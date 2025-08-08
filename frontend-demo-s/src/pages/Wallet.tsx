import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { getSocket } from "../utils/socket";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IoWalletSharp } from "react-icons/io5";
import {
  depositeButton,
  depositeHistoryButton,
  withdrawButton,
  withdrawHistoryButton,
} from "@/assets/images";

const Wallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
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
    window.addEventListener("wallet:refresh", fetchBalance);

    // Socket.io: join user room and listen for balanceUpdate
    const socket = getSocket();
    const userIdNum = user?.id ? Number(user.id) : undefined;
    if (userIdNum) {
      socket.emit("join", { room: `user:${userIdNum}` });
    }
    socket.on("balanceUpdate", (data: { userId: number; balance: number }) => {
      if (data.userId === userIdNum) {
        fetchBalance();
      }
    });

    return () => {
      window.removeEventListener("wallet:refresh", fetchBalance);
      socket.off("balanceUpdate");
    };
  }, [user?.name, user?.id]);

  return (
    <>
      <div className="relative flex items-center flex-col justify-center w-full text-white px-2 py-3 bg-[#2B3270] mb-8">
        <div className="mb-4  ">
          <ArrowLeft
            onClick={() => navigate(-1)}
            className="absolute left-2 cursor-pointer"
          />

          {/* Center Title */}
          <h2 className="text-lg font-bold ">Wallet</h2>
        </div>
        <div className="flex flex-col items-center justify-center">
          <IoWalletSharp className="text-4xl text-white" />
          <span className="text-2xl text-white mt-1">
            {loading ? (
              <span className="text-base text-gray-400">Loading...</span>
            ) : error ? (
              <span className="text-base text-red-400">{error}</span>
            ) : (
              `₹${(balance ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}`
            )}
          </span>
          <span>Total Balance</span>
        </div>
      </div>
      <div className="flex sm:flex-row justify-center items-center text-xs gap-6 bg-[#2B3270] text-gray-400 rounded-lg m-2 px-6 py-6">
        {[
          { src: depositeButton, label: "Deposit", to: "/deposit" },
          { src: depositeHistoryButton, label: "Deposit\nHistory", to: "/deposit-history" },
          { src: withdrawButton, label: "Withdraw", to: "/withdraw" },
          { src: withdrawHistoryButton, label: "Withdraw\nHistory", to: "/withdraw-history" },
        ].map(({ src, label, to }, idx) => (
          <Link to={to} key={idx} className="flex flex-col items-center justify-center text-center gap-2 w-20">
            <button
              className=""
            >
              <img src={src} alt={label} className="w-12 h-12 object-contain" />
              <span className="whitespace-pre-line">{label}</span>
            </button>
          </Link>
        ))}
      </div>


    </>
  );
};

export default Wallet;
