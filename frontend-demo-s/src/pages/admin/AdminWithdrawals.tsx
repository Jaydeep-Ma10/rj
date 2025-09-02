import { useState, useEffect } from "react";
import api from "../../utils/api";

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWithdrawals = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("adminToken");
        const res = await api.get("/admin/withdrawals", { headers: { Authorization: `Bearer ${token}` } });
        setWithdrawals(res.data.withdrawals || []);
      } catch (err: any) {
        setError("Failed to load withdrawals");
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawals();
  }, []);

  const handleAction = async (id: number, action: "verify" | "reject") => {
    try {
      const token = localStorage.getItem("adminToken");
      await api.post(`/admin/withdrawals/${id}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setWithdrawals((prev: any[]) => prev.map((w: any) => w.id === id ? { ...w, status: action === "verify" ? "approved" : "rejected" } : w));
    } catch {
      alert("Action failed");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1e2d5c] text-white rounded-xl p-3 sm:p-4 md:p-6 mt-3 md:mt-4 max-w-5xl mx-auto">
        <h2 className="text-base md:text-lg lg:text-xl font-bold mb-3 md:mb-4 text-center">
          💰 Admin Withdrawals
        </h2>
        <div className="text-center text-gray-400 py-8">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-sm md:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1e2d5c] text-white rounded-xl p-3 sm:p-4 md:p-6 mt-3 md:mt-4 max-w-5xl mx-auto">
        <h2 className="text-base md:text-lg lg:text-xl font-bold mb-3 md:mb-4 text-center">
          💰 Admin Withdrawals
        </h2>
        <div className="text-center text-red-400 py-8">
          <div className="text-3xl mb-2">❌</div>
          <p className="text-sm md:text-base">{error}</p>
        </div>
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="bg-[#1e2d5c] text-white rounded-xl p-3 sm:p-4 md:p-6 mt-3 md:mt-4 max-w-5xl mx-auto">
        <h2 className="text-base md:text-lg lg:text-xl font-bold mb-3 md:mb-4 text-center">
          💰 Admin Withdrawals
        </h2>
        <div className="text-center text-gray-400 py-8">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm md:text-base">No withdrawal requests found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 relative">
      <div className="bg-[#2B3270] text-white rounded-xl">
        {/* Mobile View */}
        <div className="block sm:hidden">
          <table className="w-full text-xs sm:text-sm md:text-base table-auto">
            <thead>
              <tr className="bg-[#374992] text-white">
                <th className="py-3 px-3 text-center font-semibold">ID</th>
                <th className="py-3 px-3 text-center font-semibold">User</th>
                <th className="py-3 px-3 text-center font-semibold">Amount</th>
                <th className="py-3 px-3 text-center font-semibold">Method</th>
                <th className="py-3 px-3 text-center font-semibold">Status</th>
                <th className="py-3 px-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w, index) => (
                <tr 
                  key={w.id} 
                  className={`border-b border-gray-700 hover:bg-[#33416d] ${
                    index === 0 ? ' bg-green-900/20' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-center text-xs font-mono">{w.id}</td>
                  <td className="py-2 px-3 text-center text-xs">{w.name || w.userId}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="font-bold text-lg text-green-500">₹{w.amount}</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
                      {w.method}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs capitalize ${
                        w.status === "approved"
                          ? "bg-green-500/20 text-green-300"
                          : w.status === "rejected"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-orange-500/20 text-orange-300"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex justify-center items-center space-x-1">
                      {w.status === "pending" && (
                        <>
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
                            onClick={() => handleAction(w.id, "verify")}
                          >
                            ✓
                          </button>
                          <button
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                            onClick={() => handleAction(w.id, "reject")}
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm md:text-base table-auto">
            <thead>
              <tr className="bg-[#293b6a] text-white">
                <th className="py-3 px-4 text-left font-semibold">ID</th>
                <th className="py-3 px-4 text-center font-semibold">User</th>
                <th className="py-3 px-4 text-center font-semibold">Amount</th>
                <th className="py-3 px-4 text-center font-semibold">Method</th>
                <th className="py-3 px-4 text-center font-semibold">Status</th>
                <th className="py-3 px-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w, index) => (
                <tr 
                  key={w.id} 
                  className={`border-b border-gray-700 hover:bg-[#33416d] ${
                    index === 0 ? 'animate-pulse bg-green-900/20' : ''
                  }`}
                >
                  <td className="py-2 px-4 font-mono text-sm md:text-base">{w.id}</td>
                  <td className="py-2 px-4 text-center">{w.name || w.userId}</td>
                  <td className="py-2 px-4 text-center">
                    <span className="font-bold text-lg md:text-xl text-green-500">₹{w.amount}</span>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
                      {w.method}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs capitalize ${
                        w.status === "approved"
                          ? "bg-green-500/20 text-green-300"
                          : w.status === "rejected"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-orange-500/20 text-orange-300"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      {w.status === "pending" && (
                        <>
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            onClick={() => handleAction(w.id, "verify")}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            onClick={() => handleAction(w.id, "reject")}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawals;