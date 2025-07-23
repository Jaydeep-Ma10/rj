import React from "react";

interface Props {
  selectedInterval: string;
  results: number[];
}

const HowToPlayCard: React.FC<Props> = ({ selectedInterval, results }) => {
  // Extract only time part (e.g., "30sec" from "WinGo 30sec")
  const displayInterval = selectedInterval.replace("WinGo", "").trim();

  return (
    <div className="bg-[#1e2d5c] p-4 rounded-xl w-full md:w-1/2 shadow-md">
      <h2 className="text-white font-semibold text-base mb-3">📌 How to Play</h2>

      <p className="text-sm text-gray-300 mb-2">
        Current Interval:{" "}
        <span className="text-yellow-300 font-medium">{displayInterval}</span>
      </p>

      <h3 className="text-sm text-white mb-2 font-medium">🟢 Last 5 Winning Numbers:</h3>

      <div className="flex gap-4">
        {results.map((num, index) => (
          <div
            key={index}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-white text-sm font-semibold bg-black text-white"
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowToPlayCard;
