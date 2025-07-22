import React, { useEffect, useState } from "react";

interface Props {
  name?: string;
}

interface Transaction {
  id: number;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  type: "Deposit" | "Withdrawal";
}

const TransactionHistory: React.FC<Props> = ({ name }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`http://localhost:5000/api/user/${encodeURIComponent(name)}/deposits`).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch deposits")),
      fetch(`http://localhost:5000/api/user/${encodeURIComponent(name)}/withdrawals`).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch withdrawals")),
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
  }, [name]);

  return (
    <div className="text-xs text-green-100 mt-2 overflow-x-auto">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-200">{error}</div>
      ) : transactions.length === 0 ? (
        <div>No transactions found.</div>
      ) : (
        <table className="min-w-full mt-2">
          <thead>
            <tr>
              <th className="px-2 py-1">Type</th>
              <th className="px-2 py-1">Amount</th>
              <th className="px-2 py-1">Method</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((tx) => (
              <tr key={tx.type + tx.id} className="border-t border-green-700">
                <td className="px-2 py-1 font-bold">{tx.type}</td>
                <td className="px-2 py-1">₹{tx.amount}</td>
                <td className="px-2 py-1">{tx.method}</td>
                <td className="px-2 py-1 capitalize">{tx.status}</td>
                <td className="px-2 py-1">{new Date(tx.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionHistory;
