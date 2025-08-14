import React from "react";

interface MyHistoryItem {
  id: string;
  period: string;
  betType: string; // e.g., "Green", "Digit 5", "BIG"
  amount: number;
  multiplier?: number;
  result?: "Win" | "Lose";
  status?: 'pending' | 'settled';
  resultNumber?: number;
  createdAt?: string;
}

interface Props {
  data: MyHistoryItem[];
  loading?: boolean;
  error?: string | null;
}

const getBetTypeColor = (betType: string) => {
  if (betType?.toLowerCase().includes('red')) return 'text-red-400';
  if (betType?.toLowerCase().includes('green')) return 'text-green-400';
  if (betType?.toLowerCase().includes('violet')) return 'text-violet-400';
  if (betType?.toLowerCase().includes('big')) return 'text-orange-400';
  if (betType?.toLowerCase().includes('small')) return 'text-blue-400';
  return 'text-white';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const MyHistoryTable: React.FC<Props> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-[#1e2d5c] text-white rounded-xl p-4 mt-4">
        <h2 className="text-lg font-bold mb-4">My Bet History</h2>
        <div className="text-center py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-[#293b6a] rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1e2d5c] text-white rounded-xl p-4 mt-4">
        <h2 className="text-lg font-bold mb-4">My Bet History</h2>
        <div className="text-center py-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#1e2d5c] text-white rounded-xl p-4 mt-4">
        <h2 className="text-lg font-bold mb-4">My Bet History</h2>
        <div className="text-center py-8 text-gray-400">
          No bets placed yet. Place your first bet to see history here.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e2d5c] text-white rounded-xl p-4 mt-4">
      <h2 className="text-lg font-bold mb-4">My Bet History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#293b6a] text-gray-300 text-left">
              <th className="p-3 font-medium">Time</th>
              <th className="p-3 font-medium">Period</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium text-right">Amount</th>
              <th className="p-3 font-medium text-right">Multiplier</th>
              <th className="p-3 font-medium text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-[#33416d] transition-colors">
                <td className="p-3 text-xs text-gray-400">
                  {formatDate(item.createdAt)}
                </td>
                <td className="p-3 font-mono">
                  {item.period}
                </td>
                <td className={`p-3 font-semibold ${getBetTypeColor(item.betType)}`}>
                  {item.betType}
                </td>
                <td className="p-3 text-right font-medium">
                  ₹{item.amount.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-right text-yellow-400">
                  {item.multiplier ? `x${item.multiplier}` : '-'}
                </td>
                <td className="p-3 text-right">
                  {item.status === 'pending' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-400 text-black">
                      Pending
                    </span>
                  ) : item.result === 'Win' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                      Win +₹{(item.amount * (item.multiplier || 1)).toLocaleString('en-IN')}
                    </span>
                  ) : item.result === 'Lose' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">
                      Lose
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyHistoryTable;
