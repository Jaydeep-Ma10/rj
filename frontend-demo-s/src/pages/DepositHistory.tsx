import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface Deposit {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
  utr: string;
  method?: string;
  slipUrl?: string;
}

const DepositHistory = () => {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.name) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/api/user/${encodeURIComponent(user.name)}/deposits`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch deposit history");
        const data = await res.json();
        setDeposits(data.deposits || []);
      })
      .catch((err) => setError(err.message || "Error fetching deposit history"))
      .finally(() => setLoading(false));
  }, [user?.name]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Deposit History</h1>
      <div className="bg-white rounded shadow p-6">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : deposits.length === 0 ? (
          <p className="text-gray-500">No deposits found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="py-2 px-3 border-b">Amount</th>
                  <th className="py-2 px-3 border-b">Status</th>
                  <th className="py-2 px-3 border-b">Date</th>
                  <th className="py-2 px-3 border-b">UTR</th>
                  <th className="py-2 px-3 border-b">Method</th>
                  <th className="py-2 px-3 border-b">Slip</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">₹{d.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3">
                      {d.status === "approved" ? (
                        <span className="text-green-600 font-semibold">Approved</span>
                      ) : d.status === "rejected" ? (
                        <span className="text-red-600 font-semibold">Rejected</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">Pending</span>
                      )}
                    </td>
                    <td className="py-2 px-3">{new Date(d.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono">{d.utr}</td>
                    <td className="py-2 px-3">{d.method || "-"}</td>
                    <td className="py-2 px-3">
                      {d.slipUrl ? (
                        <a href={`http://localhost:5000${d.slipUrl}`} target="_blank" rel="noopener noreferrer">
                          <img src={`http://localhost:5000${d.slipUrl}`} alt="slip" className="h-10 rounded shadow" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositHistory;
