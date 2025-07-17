import React, { useState } from "react";

interface WingoBetModalProps {
  open: boolean;
  onClose: () => void;
  interval: string;
  selection: string; // e.g. "Green", "Red", "Big", "5", etc.
  onSubmit: (opts: { balance: number; quantity: number; multiplier: number; agreed: boolean }) => void;
}

const BALANCES = [1, 10, 100, 1000];
const MULTIPLIERS = [1, 5, 10, 20, 50, 100];

const WingoBetModal: React.FC<WingoBetModalProps> = ({ open, onClose, interval, selection, onSubmit }) => {
  const [balance, setBalance] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [agreed, setAgreed] = useState(true);

  const total = balance * quantity * multiplier;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#232a5b] rounded-3xl w-[420px] max-w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className={`text-center text-xl font-bold py-4 ${selection === "Green" ? "bg-green-500 text-white" : selection === "Red" ? "bg-red-500 text-white" : selection === "Violet" ? "bg-purple-500 text-white" : "bg-blue-500 text-white"}`}>{`WinGo ${interval}`}</div>
        {/* Selection */}
        <div className="bg-white rounded-xl mx-6 my-4 py-3 text-center text-2xl font-semibold text-[#232a5b]">Select {selection}</div>
        {/* Balance */}
        <div className="flex flex-row items-center justify-between px-8 my-2">
          <span className="text-white text-lg">Balance</span>
          <div className="flex gap-2">
            {BALANCES.map(b => (
              <button key={b} className={`px-4 py-1 rounded-lg font-bold text-lg transition-all ${balance === b ? "bg-green-500 text-white" : "bg-[#334084] text-white"}`} onClick={() => setBalance(b)}>{b}</button>
            ))}
          </div>
        </div>
        {/* Quantity */}
        <div className="flex flex-row items-center justify-between px-8 my-2">
          <span className="text-white text-lg">Quantity</span>
          <div className="flex gap-2 items-center">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="bg-green-500 text-white rounded-lg px-3 py-1 text-lg font-bold">-</button>
            <div className="bg-[#181e41] text-white px-6 py-1 rounded-lg text-lg font-bold border-2 border-[#334084]">{quantity}</div>
            <button onClick={() => setQuantity(q => q + 1)} className="bg-green-500 text-white rounded-lg px-3 py-1 text-lg font-bold">+</button>
          </div>
        </div>
        {/* Multipliers */}
        <div className="flex flex-row gap-2 px-8 my-4">
          {MULTIPLIERS.map(m => (
            <button key={m} className={`rounded-lg px-6 py-2 font-bold text-base transition-all ${multiplier === m ? "bg-green-500 text-white" : "bg-[#334084] text-white"}`} onClick={() => setMultiplier(m)}>{`X${m}`}</button>
          ))}
        </div>
        {/* Agreement */}
        <div className="flex flex-row items-center gap-2 px-8 mb-4">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-5 h-5 accent-blue-400" id="agree" />
          <label htmlFor="agree" className="text-white text-base">I agree <span className="text-red-400">《Pre-sale rules》</span></label>
        </div>
        {/* Footer */}
        <div className="flex flex-row w-full">
          <button className="flex-1 py-4 bg-[#334084] text-white text-lg font-bold" onClick={onClose}>Cancel</button>
          <button
            className="flex-1 py-4 bg-green-500 text-white text-lg font-bold"
            disabled={!agreed}
            onClick={() => onSubmit({ balance, quantity, multiplier, agreed })}
          >
            Total amount ₹{total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WingoBetModal;
