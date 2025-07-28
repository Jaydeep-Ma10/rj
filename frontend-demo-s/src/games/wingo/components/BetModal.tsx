import React, { useState } from "react";


import { useAuth } from "../../../hooks/useAuth";

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOption: string;
  roundId: number | null;
  onSuccess?: () => void;
}

const BetModal: React.FC<BetModalProps> = ({
  isOpen,
  onClose,
  selectedOption,
  roundId,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [multiplier] = useState<number>(1);
  const [agree, setAgree] = useState<boolean>(false);

  const total = amount * quantity * multiplier;
  const presetAmounts = [1, 10, 100, 1000];

  if (!isOpen) return null;

  // 🔥 Dynamic color based on selection
  const getBackgroundColor = () => {
    const opt = selectedOption.toLowerCase();

    if (opt.includes("red")) return "#ef4444";
    if (opt.includes("green")) return "#22c55e";
    if (opt.includes("violet")) return "#8b5cf6";
    if (opt.includes("big")) return "#f97316";
    if (opt.includes("small")) return "#38bdf8";
    if (opt.includes("digit")) {
      const digit = parseInt(opt.replace("digit", "").trim(), 10);
      if ([2, 4, 6, 8].includes(digit)) return "#ef4444";
      if ([1, 3, 7, 9].includes(digit)) return "#22c55e";
      if (digit === 0)
        return "linear-gradient(to right, #ef4444 50%, #8b5cf6 50%)";
      if (digit === 5)
        return "linear-gradient(to right, #22c55e 50%, #8b5cf6 50%)";
    }

    return "#1e2d5c"; // default
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div
    className="text-white p-4 sm:p-6 rounded-xl w-full max-w-xs sm:max-w-md shadow-2xl overflow-y-auto max-h-[90vh]"
    style={{
      background: getBackgroundColor(),
      border: "2px solid white",
      boxShadow: "0 0 20px rgba(0,0,0,0.5)",
    }}
  >
        {/* Header */}
        <h2 className="text-xl font-bold mb-4 text-center">
          Selected: {selectedOption}
        </h2>

        {/* Balance row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold">Balance</span>
          <div className="flex gap-2">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`px-3 py-1 rounded-md text-sm font-bold ${
                  amt === amount ? "bg-yellow-400 text-black" : "bg-gray-700"
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold">Quantity</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="bg-gray-600 px-3 py-1 rounded-lg font-bold"
            >
              -
            </button>
            <span className="text-lg font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="bg-gray-600 px-3 py-1 rounded-lg font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Multiplier selection */}
        {/* <MultiplierGrid onSelect={(m) => setMultiplier(m)} /> */}
        <div className="grid grid-cols-6 gap-3 mt-4 w-full">
  {[1, 5, 10, 20, 50, 100].map((m) => (
    <div
      key={m}
      className="px-2 py-2 rounded-full text-center text-white font-bold text-sm cursor-pointer bg-[#1e2d5c] hover:bg-yellow-400 hover:text-black transition"
    >
      {m}x
    </div>
  ))}
</div>


        {/* I agree checkbox */}
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
            className="mr-2"
          />
          <label className="text-sm">I agree to the pre-sale rules</label>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            className="w-full py-3 bg-yellow-400 text-black font-bold text-md rounded-full"
            disabled={!agree || loading || !roundId}
            onClick={async () => {
              if (!agree || !user?.id || !roundId) return;
              setLoading(true);
              setError(null);
              try {
                const payload = {
                  userId: user.id,
                  roundId,
                  type: getBetType(selectedOption),
                  value: getBetValue(selectedOption),
                  amount: amount * quantity,
                  multiplier,
                };
                const res = await fetch("https://rj-755j.onrender.com/api/wingo/bet", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.error || "Failed to place bet");
                }
                if (onSuccess) onSuccess();
                onClose();
              } catch (e: any) {
                setError(e.message || "Failed to place bet");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Placing Bet..." : `Bet Placing Amount: ₹${total}`}
          </button>

          <button
            onClick={onClose}
            className="bg-gray-800 text-white py-2 rounded-md font-semibold"
          >
            Cancel
          </button>
        </div>
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mt-2 text-center font-bold">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to parse bet type/value from selectedOption
function getBetType(option: string) {
  const opt = option.toLowerCase();
  if (["red", "green", "violet"].some((c) => opt.includes(c))) return "color";
  if (["big", "small"].some((c) => opt.includes(c))) return "bigsmall";
  if (opt.includes("digit")) return "number";
  if (opt === "random") return "random";
  return "unknown";
}
function getBetValue(option: string) {
  const opt = option.toLowerCase();
  if (["red", "green", "violet"].some((c) => opt.includes(c))) return opt;
  if (["big", "small"].some((c) => opt.includes(c))) return opt;
  if (opt.includes("digit")) return opt.replace("digit", "").trim();
  if (opt === "random") return "random";
  return opt;
}

export default BetModal;
