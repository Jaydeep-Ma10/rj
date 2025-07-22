import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface Transaction {
  id: number;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  type: "Deposit" | "Withdrawal";
}

const AllTransactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.name) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/deposits`).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch deposits")),
      fetch(`https://rj-755j.onrender.com/api/user/${encodeURIComponent(user.name)}/withdrawals`).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch withdrawals")),
    ])
      .then(([depositData, withdrawalData]) => {
        const deposits: Transaction[] = (depositData.deposits || []).map((d: any) => ({
          ...d,
          type: "Deposit"
        }));
        const withdrawals: Transaction[] = (withdrawalData.withdrawals || []).map((w: any) => ({
          ...w,
          type: "Withdrawal"
        }));
        const combined = [...deposits, ...withdrawals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTransactions(combined);
      })
      .catch((err) => setError(typeof err === 'string' ? err : 'Error fetching transaction history'))
      .finally(() => setLoading(false));
  }, [user?.name]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-green-700">All Transactions</h1>
      <div className="bg-white rounded shadow p-6 overflow-x-auto">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-gray-500">No transactions found.</div>
        ) : (
          <table className="min-w-full mt-2">
            <thead>
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Method</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.type + tx.id} className="border-t">
                  <td className="px-4 py-2 font-bold">{tx.type}</td>
                  <td className="px-4 py-2">₹{tx.amount}</td>
                  <td className="px-4 py-2">{tx.method}</td>
                  <td className="px-4 py-2 capitalize">{tx.status}</td>
                  <td className="px-4 py-2">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllTransactions;
