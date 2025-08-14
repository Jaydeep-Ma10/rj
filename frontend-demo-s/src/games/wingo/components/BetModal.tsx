import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../utils/api";

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

  const total = amount * quantity;
  const presetAmounts = [1, 10, 100, 1000];

  if (!isOpen) return null;

  const getPrimaryColor = () => {
    const opt = selectedOption.toLowerCase();
    if (opt.includes("digit")) {
      const digit = parseInt(opt.replace("digit", "").trim(), 10);
      if ([0, 5].includes(digit)) return digit === 0 ? "red" : "green";
      if ([2, 4, 6, 8].includes(digit)) return "red";
      if ([1, 3, 7, 9].includes(digit)) return "green";
    }
    if (opt.includes("red")) return "red";
    if (opt.includes("green")) return "green";
    return null;
  };

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
    return "#1e2d5c";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[52]">
      <div
        className={`text-white w-full sm:max-w-md max-h-[100vh] overflow-y-auto transform transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          background: "#2B3270",
        }}
      >
        {/* Header */}
        <div
          className="flex justify-center items-center px-2 py-3 mb-4"
          style={{ background: getBackgroundColor() }}
        >
          <h2 className="px-10 bg-white text-md rounded-md text-center text-black">
            Selected {selectedOption}
          </h2>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {/* Balance Row */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Balance</span>
            <div className="flex gap-2">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`px-3 py-1 rounded-md text-sm font-bold ${
                    amt === amount
                      ? getPrimaryColor() === "green"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-[#374992] text-gray-400"
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Row */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Quantity</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className={`bg-gray-600 px-3 py-1 rounded-lg font-bold ${
                  getPrimaryColor() === "green"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                -
              </button>
              <span className="text-lg font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className={`bg-gray-600 px-3 py-1 rounded-lg font-bold ${
                  getPrimaryColor() === "green"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                +
              </button>
            </div>
          </div>

          {/* Multiplier Grid */}
          <div className="grid grid-cols-6 gap-3 mt-4 w-full">
            {[1, 5, 10, 20, 50, 100].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setQuantity(m);
                }}
                className={`px-2 py-2 rounded-md text-center font-bold text-sm cursor-pointer transition ${
                  m === quantity
                    ? getPrimaryColor() === "green"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-[#374992] text-gray-400"
                }`}
              >
                {m}x
              </button>
            ))}
          </div>

          {/* Agree Checkbox */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              className="mr-2"
            />
            <label className="text-sm">I agree to the pre-sale rules</label>
          </div>

          {/* Action Buttons - side by side */}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500 text-white p-2 rounded mt-2 text-center font-bold">
              {error}
            </div>
          )}
        </div>
        <div className="flex mt-6 w-full">
          <button
            onClick={onClose}
            className="w-2/5 py-1 bg-[#374992] text-gray-400 font-semibold rounded-none"
          >
            Cancel
          </button>
          <button
            className={`w-3/5 py-1 text-black font-bold text-md rounded-none ${
                  getPrimaryColor() === "green"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
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
                await api.post("/wingo/bet", payload);
                if (onSuccess) onSuccess();
                onClose();
              } catch (e: any) {
                setError(e.message || "Failed to place bet");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Placing Bet..." : `Total Amount: ₹${total}`}
          </button>
        </div>
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
