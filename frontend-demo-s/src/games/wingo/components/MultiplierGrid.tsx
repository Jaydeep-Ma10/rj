import React, { useState } from "react";

interface Props {
  onSelect: (multiplier: number | "Random") => void;
}

const multipliers = [1, 5, 10, 20, 50, 100];

const MultiplierGrid: React.FC<Props> = ({ onSelect }) => {
  const [selected, setSelected] = useState<number | "Random" | null>(null);

  const handleClick = (value: number | "Random") => {
    setSelected(value);
    onSelect(value);
  };

  return (
    <div className="grid grid-cols-7 gap-3 mt-6 w-full">
      <div
        onClick={() => handleClick("Random")}
        className={`px-2 py-2 rounded-full text-center font-bold text-sm cursor-pointer shadow-md
          hover:scale-105 transition-transform ${
            selected === "Random"
              ? "bg-pink-400 text-black"
              : "bg-[#1e2d5c] text-white"
          }`}
      >
        🎲 Random
      </div>

      {multipliers.map((m) => (
        <div
          key={m}
          onClick={() => handleClick(m)}
          className={`px-2 py-2 rounded-full text-center font-bold text-sm cursor-pointer shadow-md
            hover:scale-105 transition-transform ${
              selected === m ? "bg-yellow-400 text-black" : "bg-[#1e2d5c] text-white"
            }`}
        >
          {m}x
        </div>
      ))}
    </div>
  );
};

export default MultiplierGrid;
