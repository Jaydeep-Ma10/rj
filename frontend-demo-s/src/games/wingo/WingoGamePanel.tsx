import React, { useEffect, useState } from "react";
import WingoBetModal from "./WingoBetModal";

// Helper for formatting timer
function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `00:${m}:${s}`;
}

const COLORS = [
  { name: "Green", className: "bg-green-500" },
  { name: "Violet", className: "bg-purple-500" },
  { name: "Red", className: "bg-red-500" },
];
const MULTIPLIERS = ["Random", "X1", "X5", "X10", "X20", "X50", "X100"];
const NUMBERS = [
  { n: 0, color: "dual-red-violet" }, // red+violet
  { n: 1, color: "green" },
  { n: 2, color: "red" },
  { n: 3, color: "green" },
  { n: 4, color: "red" },
  { n: 5, color: "dual-green-violet" }, // green+violet
  { n: 6, color: "red" },
  { n: 7, color: "green" },
  { n: 8, color: "green" },
  { n: 9, color: "red" }
];
const PERIODS = ["30s", "1m", "3m", "5m"];

interface WingoGamePanelProps {
  interval: string;
  userId: number;
}

const WingoGamePanel: React.FC<WingoGamePanelProps> = ({ interval = "30s", userId }) => {
  // State
  const [timer, setTimer] = useState(7); // default for demo
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [recentWinners, setRecentWinners] = useState<any[]>([]); // [{period, winners: [0,5,6,7,9]}]
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedMultiplier, setSelectedMultiplier] = useState<string>("X1");
  const [selectedBigSmall, setSelectedBigSmall] = useState<string | null>(null);
  const [betModal, setBetModal] = useState<{open: boolean, selection: string | null}>({open: false, selection: null});

  // Fetch current round info & timer
  useEffect(() => {
    async function fetchRound() {
      const res = await fetch(`https://rj-755j.onrender.com/api/wingo/round/current?interval=${interval}`);
      if (res.ok) {
        const round = await res.json();
        setCurrentRound(round);
        // Calculate remaining time
        const end = new Date(round.endTime).getTime();
        const now = Date.now();
        setTimer(Math.max(0, Math.floor((end - now) / 1000)));
      }
    }
    fetchRound();
    const id = setInterval(fetchRound, 5000);
    return () => clearInterval(id);
  }, [interval]);

  // Poll wallet:refresh every 5 seconds to keep balance up-to-date (for both win/loss)
  useEffect(() => {
    const poll = setInterval(() => {
      window.dispatchEvent(new CustomEvent('wallet:refresh'));
    }, 5000);
    return () => clearInterval(poll);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Fetch recent winners for all periods
  useEffect(() => {
    async function fetchWinners() {
      const all = await Promise.all(PERIODS.map(async (p) => {
        const res = await fetch(`https://rj-755j.onrender.com/api/wingo/history?interval=${p}`);
        if (res.ok) {
          const data = await res.json();
          return { period: p, winners: data.slice(0, 5).map((r: any) => r.resultNumber) };
        }
        return { period: p, winners: [] };
      }));
      setRecentWinners(all);
    }
    fetchWinners();
  }, []);

  // Bet state
  const [betAmount, setBetAmount] = useState<number>(10);
  const [placingBet, setPlacingBet] = useState(false);
  const [betMessage, setBetMessage] = useState<string|null>(null);

  // Place bet handler (refactored)
  async function handlePlaceBet({selection, amount, multiplier}: {selection: string, amount: number, multiplier: number}) {
    if (!userId) {
      setBetMessage("User ID missing. Please log in again.");
      console.error("[Wingo] Attempted to place bet with missing userId", { userId });
      return;
    }
    if (!currentRound) return;
    setPlacingBet(true);
    setBetMessage(null);
    let type = "", value: string|number = "";
    // Determine type/value from selection
    if (["green","red","violet"].includes(selection.toLowerCase())) {
      type = "color";
      value = selection.toLowerCase();
    } else if (["big","small"].includes(selection.toLowerCase())) {
      type = "bigsmall";
      value = selection.toLowerCase();
    } else if (!isNaN(Number(selection))) {
      type = "number";
      value = Number(selection);
    } else {
      setBetMessage("Please select a bet."); setPlacingBet(false); return;
    }
    try {
      const res = await fetch(`https://rj-755j.onrender.com/api/wingo/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roundId: currentRound.id, type, value, amount, multiplier })
      });
      const data = await res.json();
      if (res.ok) {
        setBetMessage("Bet placed successfully!");
        // Dispatch wallet refresh event
        window.dispatchEvent(new CustomEvent('wallet:refresh'));
      } else {
        setBetMessage(data.error || "Failed to place bet.");
      }
    } catch (e:any) {
      setBetMessage(e.message || "Network error");
    } finally {
      setPlacingBet(false);
      setSelectedColor(null); setSelectedNumber(null); setSelectedBigSmall(null); setSelectedMultiplier("X1");
    }
  }

  // UI rendering
  return (
    <div className="w-full max-w-xl mx-auto mt-6">
      {/* Top Section: How to play, timer, recent winners */}
      <div className="flex flex-row bg-[#3a4db8] rounded-2xl p-4 justify-between items-center mb-4">
        {/* Left: How to play & winners */}
        <div className="flex-1 flex flex-col gap-2">
          <button className="flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full w-max"><span className="material-icons text-base" aria-hidden="true">menu_book</span>How to play</button>
          <div className="text-white text-sm font-semibold mt-1">WinGo {interval}</div>
          <div className="flex flex-row gap-1 mt-1">
            {recentWinners.find(r => r.period === interval)?.winners.map((w, i) => (
              <span key={i} className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-white text-white text-base font-bold ${NUMBERS[w as number]?.color === "green" ? "bg-green-500" : NUMBERS[w as number]?.color === "red" ? "bg-red-500" : "bg-purple-500"}`}>{w}</span>
            ))}
          </div>
        </div>
        {/* Divider */}
        <div className="h-24 w-0.5 bg-white/20 mx-4 rounded-full"></div>
        {/* Right: Timer & round info */}
        <div className="flex flex-col items-end gap-2 min-w-[140px]">
          <div className="text-white font-semibold text-base">Time remaining</div>
          <div className="flex flex-row gap-1 text-2xl font-mono text-white bg-black/30 px-3 py-1 rounded-lg">
            {formatTimer(timer).split("").map((c, i) => <span key={i}>{c}</span>)}
          </div>
          <div className="text-white text-xs font-mono mt-2">{currentRound?.period || "-"}</div>
        </div>
      </div>
      {/* Color buttons */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {COLORS.map(c => (
          <button key={c.name} className={`${c.className} text-white font-bold py-2 rounded-2xl text-xl shadow transition-all ${selectedColor === c.name ? 'ring-4 ring-white/70' : ''}`} onClick={() => setBetModal({open: true, selection: c.name})}>{c.name}</button>
        ))}
      </div>
      {/* Numbers grid */}
      <div className="bg-[#232a5b] rounded-2xl p-4 grid grid-cols-5 gap-4 mb-4">
        {NUMBERS.map((b, i) => (
          <button
            key={i}
            className={`rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold border-4 transition-all
              ${b.color === "green" ? "bg-green-500 border-green-300"
                : b.color === "red" ? "bg-red-500 border-red-300"
                : b.color === "dual-red-violet" ? "border-purple-300" // border as violet
                : b.color === "dual-green-violet" ? "border-green-300"
                : "bg-purple-500 border-purple-300"}
              ${selectedNumber === b.n ? 'ring-4 ring-white/70' : ''}`}
            onClick={() => {
  setSelectedNumber(b.n);
  setBetModal({open: true, selection: b.n.toString()});
}}
            style={b.color === "dual-red-violet"
              ? { background: "linear-gradient(135deg, #ef4444 50%, #a78bfa 50%)" }
              : b.color === "dual-green-violet"
                ? { background: "linear-gradient(135deg, #22c55e 50%, #a78bfa 50%)" }
                : {}}
          >{b.n}</button>
        ))}
      </div>
      {/* Multipliers */}
      <div className="flex flex-row gap-2 mb-4">
        {MULTIPLIERS.map(m => (
          <button key={m} className={`rounded-xl px-5 py-2 font-bold text-base transition-all ${selectedMultiplier === m ? (m === "Random" ? "bg-red-700 text-white" : "bg-green-500 text-white") : "bg-[#232a5b] text-[#b0b6e6]"}`} onClick={() => setSelectedMultiplier(m)}>{m}</button>
        ))}
      </div>
      {/* Big/Small */}
      <div className="grid grid-cols-2 gap-4 mb-2">
        <button className={`rounded-full py-3 text-xl font-bold transition-all ${selectedBigSmall === "Big" ? "bg-yellow-400 text-white" : "bg-yellow-300 text-[#232a5b]"}`} onClick={() => setBetModal({open: true, selection: "Big"})}>Big</button>
        <button className={`rounded-full py-3 text-xl font-bold transition-all ${selectedBigSmall === "Small" ? "bg-blue-500 text-white" : "bg-blue-400 text-[#232a5b]"}`} onClick={() => setBetModal({open: true, selection: "Small"})}>Small</button>
      </div>
      {/* Bet amount and Place Bet removed as per request */}
      {/* Bet modal */}
      <WingoBetModal
        open={betModal.open}
        onClose={() => setBetModal({open: false, selection: null})}
        interval={interval}
        selection={betModal.selection || ""}
        onSubmit={({ balance, quantity, multiplier }) => {
          // Compose amount from modal values
          const amount = balance * quantity;
          handlePlaceBet({ selection: betModal.selection || "", amount, multiplier });
          setBetModal({open: false, selection: null});
        }}
      />
    </div>
  );
};

export default WingoGamePanel;
