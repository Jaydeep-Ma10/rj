import React, { useEffect, useState } from "react";
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
      setWithdrawals((prev) => prev.map(w => w.id === id ? { ...w, status: action === "verify" ? "approved" : "rejected" } : w));
    } catch {
      alert("Action failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-8 rounded shadow relative">
      <h2 className="text-2xl font-bold mb-6">Manual Withdrawal Requests</h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : withdrawals.length === 0 ? (
        <div className="text-gray-500">No withdrawal requests found.</div>
      ) : (
        <table className="min-w-full mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="px-4 py-2">{w.id}</td>
                <td className="px-4 py-2">{w.name || w.userId}</td>
                <td className="px-4 py-2">₹{w.amount}</td>
                <td className="px-4 py-2">{w.method}</td>
                <td className="px-4 py-2 capitalize">{w.status}</td>
                <td className="px-4 py-2 flex gap-2">
                  {w.status === "pending" && (
                    <>
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        onClick={() => handleAction(w.id, "verify")}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        onClick={() => handleAction(w.id, "reject")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminWithdrawals;
