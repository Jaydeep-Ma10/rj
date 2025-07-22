import { useAuth } from "../hooks/useAuth";
import React, { useEffect, useState } from "react";

const WithdrawHistory = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.name) return;
    setLoading(true);
    setError(null);
    fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/withdrawals`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch withdrawal history");
        const data = await res.json();
        setWithdrawals(data.withdrawals || []);
      })
      .catch((err) => setError(err.message || "Error fetching withdrawal history"))
      .finally(() => setLoading(false));
  }, [user?.name]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-red-700">Withdraw History</h1>
      <div className="bg-white rounded shadow p-6">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : withdrawals.length === 0 ? (
          <div className="text-gray-500">No withdrawals found.</div>
        ) : (
          <table className="min-w-full mt-2">
            <thead>
              <tr>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Method</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="px-4 py-2">₹{w.amount}</td>
                  <td className="px-4 py-2">{w.method}</td>
                  <td className="px-4 py-2 capitalize">{w.status}</td>
                  <td className="px-4 py-2">{new Date(w.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WithdrawHistory;
