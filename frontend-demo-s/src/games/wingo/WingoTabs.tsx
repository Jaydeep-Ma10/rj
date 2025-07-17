import React, { useState } from "react";

const TABS = [
  { label: "Game history", key: "history" },
  { label: "Chart", key: "chart" },
  { label: "My history", key: "myhistory" }
];

const COLORS: Record<string, string> = {
  green: "bg-green-500 text-green-500",
  red: "bg-red-500 text-red-500",
  violet: "bg-purple-500 text-purple-500"
};

// Dummy data for demonstration
const historyData = [
  { period: "20250712100030103", number: 9, bigSmall: "Big", color: "green" },
  { period: "20250712100030102", number: 2, bigSmall: "Small", color: "red" },
  { period: "20250712100030101", number: 2, bigSmall: "Small", color: "red" },
  { period: "20250712100030100", number: 2, bigSmall: "Small", color: "red" },
  { period: "20250712100030099", number: 9, bigSmall: "Big", color: "green" },
  { period: "20250712100030098", number: 8, bigSmall: "Big", color: "red" },
  { period: "20250712100030097", number: 6, bigSmall: "Big", color: "red" }
];

const chartNumbers = Array.from({length: 10}, (_, i) => i);
const chartData = chartNumbers.map(n => ({
  number: n,
  winning: Math.floor(Math.random() * 20),
  missing: Math.floor(Math.random() * 10),
  avgMissing: (Math.random() * 5).toFixed(2),
  freq: Math.floor(Math.random() * 10),
  maxConsec: Math.floor(Math.random() * 5)
}));

interface WingoTabsProps {
  interval: string;
  userId: number;
}

const WingoTabs: React.FC<WingoTabsProps> = ({ interval, userId }) => {
  const [tab, setTab] = useState("history");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  // Fetch game history
  React.useEffect(() => {
    if (tab !== "history" && tab !== "chart") return;
    setLoading(true); setError(null);
    fetch(`https://rj-755j.onrender.com/api/wingo/history?interval=${interval}`)
      .then(r => r.json())
      .then(data => {
        setHistoryData(data);
        // For chart: calculate stats from history if no /chart endpoint
        if (tab === "chart") {
          const numbers = Array.from({length: 10}, (_, i) => i);
          const chart = numbers.map(n => {
            const periods = data.slice(0, 100);
            const winning = periods.filter((r:any) => r.resultNumber === n).length;
            const missing = periods.reduce((acc:any, r:any) => r.resultNumber === n ? 0 : acc + 1, 0);
            const freq = winning;
            // avgMissing, maxConsec are mock-calculated for now
            return { number: n, winning, missing, avgMissing: '-', freq, maxConsec: '-' };
          });
          setChartData(chart);
        }
      })
      .catch(e => setError("Failed to load history."))
      .finally(() => setLoading(false));
  }, [interval, tab]);

  // Fetch my history
  React.useEffect(() => {
    if (tab !== "myhistory" || !userId) {
      setMyHistory([]);
      return;
    }
    setLoading(true); setError(null);
    fetch(`https://rj-755j.onrender.com/api/wingo/my-bets?userId=${userId}`)
      .then(r => r.json())
      .then(setMyHistory)
      .catch(e => setError("Failed to load your bets."))
      .finally(() => setLoading(false));
  }, [userId, tab]);

  return (
    <div className="w-full max-w-xl mx-auto mt-6">
      {/* Tabs */}
      <div className="flex flex-row gap-4 mb-4">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`px-6 py-2 rounded-xl font-bold text-lg transition-all ${tab === t.key ? "bg-blue-500 text-white shadow" : "bg-[#232a5b] text-[#b0b6e6]"}`}
            onClick={() => setTab(t.key)}
          >{t.label}</button>
        ))}
      </div>
      {/* Tab panels */}
      {tab === "history" && (
        <div className="bg-[#232a5b] rounded-2xl p-4">
          {loading ? <div className="text-white text-center">Loading...</div> : error ? <div className="text-red-400 text-center">{error}</div> : (
          <table className="w-full text-center">
            <thead>
              <tr className="text-[#b0b6e6] text-lg">
                <th className="py-2">Period</th>
                <th>Number</th>
                <th>Big Small</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((row, i) => (
                <tr key={row.period || row.id || i} className="border-b border-[#334084] last:border-0">
                  <td className="py-2 text-[#b0b6e6] font-mono">{row.period || row.id}</td>
                  <td className={`font-bold text-xl ${row.resultColor === "green" ? "text-green-500" : row.resultColor === "red" ? "text-red-500" : "text-purple-400"}`}>{row.resultNumber}</td>
                  <td className="text-[#b0b6e6]">{row.resultBigSmall}</td>
                  <td><span className={`inline-block w-4 h-4 rounded-full ${COLORS[row.resultColor]}`}>{row.resultColor ? row.resultColor.charAt(0).toUpperCase() + row.resultColor.slice(1) : ''}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}
      {tab === "chart" && (
        <div className="bg-[#232a5b] rounded-2xl p-4">
          {loading ? <div className="text-white text-center">Loading...</div> : error ? <div className="text-red-400 text-center">{error}</div> : (
          <table className="w-full text-center">
            <thead>
              <tr className="text-[#b0b6e6] text-lg">
                <th className="py-2">Number</th>
                <th>Winning</th>
                <th>Missing</th>
                <th>Avg Missing</th>
                <th>Frequency</th>
                <th>Max Consec.</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => (
                <tr key={row.number} className="border-b border-[#334084] last:border-0">
                  <td className="py-2 font-bold text-xl text-[#b0b6e6]">{row.number}</td>
                  <td className="text-green-400">{row.winning}</td>
                  <td className="text-red-400">{row.missing}</td>
                  <td className="text-blue-400">{row.avgMissing}</td>
                  <td className="text-yellow-400">{row.freq}</td>
                  <td className="text-purple-400">{row.maxConsec}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}
      {tab === "myhistory" && (
        <div className="bg-[#232a5b] rounded-2xl p-4 text-[#b0b6e6] text-center">
          {loading ? <div className="text-white">Loading...</div> : error ? <div className="text-red-400">{error}</div> : myHistory.length === 0 ? <div className="text-lg">No bets yet. Your bets will appear here.</div> : (
            <table className="w-full text-center">
              <thead>
                <tr className="text-[#b0b6e6] text-lg">
                  <th className="py-2">Bet ID</th>
                  <th>Period</th>
                  <th>Number</th>
                  <th>Big Small</th>
                  <th>Color</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myHistory.map((row, i) => (
                  <tr key={row.betId || row.id || i} className="border-b border-[#334084] last:border-0">
                    <td className="py-2 text-[#b0b6e6] font-mono">{row.betId ?? row.id ?? '-'}</td>
                    <td className="text-[#b0b6e6] font-mono">{row.period ?? row.roundId ?? '-'}</td>
                    <td className={`font-bold text-xl ${row.resultColor === "green" ? "text-green-500" : row.resultColor === "red" ? "text-red-500" : "text-purple-400"}`}>{row.resultNumber ?? '-'}</td>
                    <td className="text-[#b0b6e6]">{row.resultBigSmall ?? '-'}</td>
                    <td><span className={`inline-block w-4 h-4 rounded-full ${COLORS[row.resultColor]}`}>{row.resultColor ? row.resultColor.charAt(0).toUpperCase() + row.resultColor.slice(1) : '-'}</span></td>
                    <td className="text-[#b0b6e6]">₹{row.amount ?? '-'}</td>
                    <td className="text-[#b0b6e6]">{row.status ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default WingoTabs;
