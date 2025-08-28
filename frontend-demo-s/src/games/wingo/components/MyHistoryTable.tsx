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
      <div className="bg-[#1e2d5c] text-white rounded-xl p-4 mt-4 mb-32">
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
      <div className="bg-[#1e2d5c] text-white rounded-xl p-4 mt-4 mb-32">
        <h2 className="text-lg font-bold mb-4">My Bet History</h2>
        <div className="text-center py-8">
          <div className="mb-4">
            {error.includes("Too many requests") ? (
              <div className="bg-yellow-900/20 border border-yellow-500/50 text-yellow-300 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-medium">Rate Limited</span>
                </div>
                <p className="text-sm mb-3">
                  We're fetching data too frequently. Please wait a moment for automatic refresh.
                </p>
                <div className="text-xs text-yellow-400">
                  Auto-refresh in progress...
                </div>
              </div>
            ) : (
              <div className="bg-red-900/20 border border-red-500/50 text-red-300 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Unable to Load</span>
                </div>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
          
          {/* Show any existing data even if there's an error */}
          {data.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-3">
                Showing last loaded data:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#293b6a] text-gray-300 text-left">
                      <th className="p-3 font-medium">Time</th>
                      <th className="p-3 font-medium">Period</th>
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium text-right">Amount</th>
                      <th className="p-3 font-medium text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {data.slice(0, 3).map((item) => (
                      <tr key={item.id} className="hover:bg-[#33416d] transition-colors opacity-60">
                        <td className="p-3 text-xs text-gray-400">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="p-3 font-mono text-xs">
                          {item.period}
                        </td>
                        <td className={`p-3 font-semibold text-xs ${getBetTypeColor(item.betType)}`}>
                          {item.betType}
                        </td>
                        <td className="p-3 text-right font-medium text-xs">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right text-xs">
                          {item.status === 'pending' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-400 text-black">
                              Pending
                            </span>
                          ) : item.result === 'Win' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                              Win
                            </span>
                          ) : item.result === 'Lose' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">
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
              {data.length > 3 && (
                <p className="text-xs text-gray-500 mt-2">
                  ... and {data.length - 3} more entries
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#1e2d5c] text-white rounded-xl p-4 mt-4 mb-32">
        <h2 className="text-lg font-bold mb-4">My Bet History</h2>
        <div className="text-center py-8 text-gray-400">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-lg mb-2">No bets yet</p>
          <p className="text-sm">
            Place your first bet to see history here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e2d5c] text-white rounded-xl p-4 mt-4 mb-32">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">My Bet History</h2>
        <div className="text-xs text-gray-400">
          {data.length} bet{data.length !== 1 ? 's' : ''}
        </div>
      </div>
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