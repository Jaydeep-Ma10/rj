import { useAuth } from "../hooks/useAuth";

import { useEffect, useState } from "react";

const Account = () => {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.name) return;
    setLoading(true);
    setError(null);
    // Fetch balance
    fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/balance`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch balance");
        const data = await res.json();
        setBalance(data.balance);
      })
      .catch((err) => setError(err.message || "Error fetching balance"))
      .finally(() => setLoading(false));
    // Fetch profile (id, lastLogin, etc)
    fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/profile`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.user);
      })
      .catch(() => {});
  }, [user?.name]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
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
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white bg-blue-900 px-2 rounded">{user?.name || "MEMBER"}</span>
            {/* <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-semibold">VIP0</span> */}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-yellow-400 text-white px-2 py-1 rounded text-xs font-semibold">UID</span>
            <span className="text-yellow-300 font-mono text-lg">{profile?.id || '-'}</span>
            {/* <button onClick={() => navigator.clipboard.writeText(profile?.id ? String(profile.id) : "")} className="text-yellow-400 ml-1">📋</button> */}
          </div>
          {/* <div className="text-gray-300 text-xs mt-1">Last login: {profile ? (profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never') : '-'}</div> */}
        </div>
      </div>
      <div className="bg-blue-900 rounded-lg p-6 text-white mb-6">
        <div className="text-lg font-semibold mb-2">Total balance</div>
        <div className="text-3xl font-bold mb-2">
  {loading ? (
    <span className="text-base text-gray-400">Loading...</span>
  ) : error ? (
    <span className="text-base text-red-400">{error}</span>
  ) : (
    `₹${(balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  )}
</div>
        <div className="flex gap-6 justify-center mt-4">
          <a href="/deposit" className="flex flex-col items-center hover:scale-105 transition">
            <div className="bg-orange-500 rounded-full p-3 mb-1">💸</div>
            <div className="text-orange-100 font-semibold">Deposit</div>
          </a>
          <a href="/withdraw" className="flex flex-col items-center hover:scale-105 transition">
            <div className="bg-blue-500 rounded-full p-3 mb-1">🏧</div>
            <div className="text-blue-100 font-semibold">Withdraw</div>
          </a>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Game History - Placeholder */}
        <div className="bg-blue-800 rounded-lg p-4 text-white flex flex-col justify-between">
          <div>
            <div className="font-semibold">Game History</div>
            <div className="text-xs text-blue-200 mb-2">My game history</div>
          </div>
          <div className="text-xs text-blue-100 mt-2">Coming Soon</div>
        </div>
        {/* Transaction History - Link Button */}
        <a href="/all-transactions" className="bg-green-800 rounded-lg p-4 text-white flex flex-col justify-between hover:scale-105 transition">
          <div>
            <div className="font-semibold">Transaction</div>
            <div className="text-xs text-green-200 mb-2">My transaction history</div>
          </div>
          <div className="text-xs text-green-100 mt-2 underline">View All →</div>
        </a>
        {/* Deposit History - Link */}
        <a href="/deposit-history" className="bg-pink-800 rounded-lg p-4 text-white flex flex-col justify-between hover:scale-105 transition">
          <div>
            <div className="font-semibold">Deposit</div>
            <div className="text-xs text-pink-200 mb-2">My deposit history</div>
          </div>
          <div className="text-xs text-pink-100 mt-2 underline">View Details →</div>
        </a>
        {/* Withdraw History - Link */}
        <a href="/withdraw-history" className="bg-orange-800 rounded-lg p-4 text-white flex flex-col justify-between hover:scale-105 transition">
          <div>
            <div className="font-semibold">Withdraw</div>
            <div className="text-xs text-orange-200 mb-2">My withdraw history</div>
          </div>
          <div className="text-xs text-orange-100 mt-2 underline">View Details →</div>
        </a>
      </div>
      <button
        onClick={logout}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Account;
