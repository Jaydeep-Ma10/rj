import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { depositeButton, withdrawButton } from "@/assets/images";
import { MdRefresh } from "react-icons/md";
import { FaPowerOff } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Account = () => {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.name) return;
    setLoading(true);
    setError(null);
    // Fetch balance
    fetch(
      `https://rj-755j.onrender.com/api/user/${encodeURIComponent(
        user.name
      )}/balance`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch balance");
        const data = await res.json();
        setBalance(data.balance);
      })
      .catch((err) => setError(err.message || "Error fetching balance"))
      .finally(() => setLoading(false));
    // Fetch profile (id, lastLogin, etc)
    fetch(
      `https://rj-755j.onrender.com/api/user/${encodeURIComponent(
        user.name
      )}/profile`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.user);
      })
      .catch(() => {});
  }, [user?.name]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#2B3270] pt-8 px-4 rounded-b-[6rem]">
        <div className="flex items-center gap-4 mb-6">
          <img
          src={user?.avatarUrl
            ? user.avatarUrl
            : (() => {
                // Stable pseudo-random avatar for user
                let hash = 0;
                const key = profile?.id || user?.name || '';
                for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
                const gender = Math.abs(hash) % 2 === 0 ? 'men' : 'women';
                const avatarId = Math.abs(hash) % 99 + 1;
                return `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
              })()
          }
          alt="avatar"
          className="w-20 h-20 rounded-full object-cover border-4 border-blue-400"
        />
          {/* <img
            src={(() => {
              let hash = 0;
              const key = profile?.id || user?.name || "";
              for (let i = 0; i < key.length; i++)
                hash = key.charCodeAt(i) + ((hash << 5) - hash);
              const gender = Math.abs(hash) % 2 === 0 ? "men" : "women";
              const avatarId = (Math.abs(hash) % 99) + 1;
              return `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
            })()}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover"
          /> */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-white px-2 rounded">
                {user?.name || "MEMBER"}
              </span>
              {/* <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-semibold">VIP0</span> */}
            </div>
            <div className="flex items-center gap-1">
              <span className=" text-white pl-2 py-1 rounded text-xs font-semibold">
                UID
              </span>
              <span className="text-white font-mono text-lg">
                {profile?.id || "-"}
              </span>
              {/* <button onClick={() => navigator.clipboard.writeText(profile?.id ? String(profile.id) : "")} className="text-yellow-400 ml-1">📋</button> */}
            </div>
            {/* <div className="text-gray-300 text-xs mt-1">Last login: {profile ? (profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never') : '-'}</div> */}
          </div>
        </div>
        <div className="bg-[#374992] rounded-lg p-3 text-white mb-6 mx-2">
          <div className="text-lg font-semibold">Total balance</div>
          <div className="text-lg font-semibold mb-2 flex">
            {loading ? (
              <span className="text-base text-gray-400">Loading...</span>
            ) : error ? (
              <span className="text-base text-red-400">{error}</span>
            ) : (
              `₹${(balance ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}`
            )}
            <MdRefresh
              size={16}
              className="text-gray-300 cursor-pointer mt-1"
              title="Refresh Balance"
            />
          </div>
          <div className="flex gap-6 justify-center mt-4">
            <a
              href="/deposit"
              className="flex flex-col items-center hover:scale-105 transition"
            >
              <img src={depositeButton} alt="" className="w-12 h-12" />
              <div className="text-orange-100 font-semibold">Deposit</div>
            </a>
            <a
              href="/withdraw"
              className="flex flex-col items-center hover:scale-105 transition"
            >
              <img src={withdrawButton} alt="" className="w-12 h-12" />
              <div className="text-blue-100 font-semibold">Withdraw</div>
            </a>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 px-4 mb-6 text-center">
        {/* Game History - Placeholder */}
        <div className="bg-[#2B3270] rounded-lg px-2 text-white flex justify-center items-center hover:scale-105 transition">
          {/* <div className="flex-shrink-0">
            <img
              src={withdrawButton}
              alt="Withdraw"
              className="w-10 h-10 object-contain"
            />
          </div> */}
          <div className="flex flex-col">
            <div className=" font-semibold">Game History</div>
            <div className="text-xs text-white mb-2">My game history</div>
            <div className="text-xs text-gray-400">Coming Soon</div>
          </div>
        </div>

        {/* Transaction History - Link Button */}
        <a
          href="/all-transactions"
          className="bg-[#2B3270] rounded-lg p-4 text-white flex justify-center items-center hover:scale-105 transition"
        >
          {/* <div className="flex-shrink-0">
            <img
              src={withdrawButton}
              alt="Withdraw"
              className="w-10 h-10 object-contain"
            />
          </div> */}
          <div className="flex flex-col">
            <div className=" font-semibold">Transaction</div>
            <div className="text-xs text-white">My transaction history</div>
            <div className="text-xs text-gray-400 underline">View All →</div>
          </div>
        </a>

        {/* Deposit History - Link */}
        <a
          href="/deposit-history"
          className="bg-[#2B3270] rounded-lg p-4 text-white flex justify-center items-center hover:scale-105 transition"
        >
          {/* <div className="flex-shrink-0">
            <img
              src={withdrawButton}
              alt="Withdraw"
              className="w-10 h-10 object-contain"
            />
          </div> */}

          <div className="flex flex-col">
            <div className=" font-semibold">Deposit History</div>
            <div className="text-xs text-white">My deposit history</div>
            <div className="text-xs text-gray-400 underline mt-1">
              View Details →
            </div>
          </div>
        </a>
        {/* Withdraw History - Link */}
        <a
          href="/withdraw-history"
          className="bg-[#2B3270] rounded-lg p-4 text-white flex justify-center items-center hover:scale-105 transition"
        >
          {/* <div className="flex-shrink-0">
            <img
              src={withdrawButton}
              alt="Withdraw"
              className="w-10 h-10 object-contain"
            />
          </div> */}

          <div className="flex flex-col">
            <div className="font-semibold">Withdraw</div>
            <div className="text-xs text-white">My withdraw history</div>
            <div className="text-xs text-gray-400 underline mt-1">
              View Details →
            </div>
          </div>
        </a>
      </div>

      <div className="flex justify-center items-center ">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }
          }
          className="w-full border border-[#61A9FF]  text-[#61A9FF] py-2 mx-4 rounded-3xl font-bold hover:bg-red-700 transition"
        >
          <FaPowerOff className="inline mr-1 text-xl" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Account;
