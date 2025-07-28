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
    <div className="flex flex-wrap gap-x-1 gap-y-1 md:grid md:grid-cols-7 md:gap-3 mt-2 sm:mt-4 md:mt-6 w-full min-w-0">
      <div
        onClick={() => handleClick("Random")}
        className={`flex-1 min-w-0 px-1 py-1 sm:px-2 sm:py-1 md:py-2 rounded-full text-center font-bold text-xs sm:text-sm md:text-base cursor-pointer shadow-md flex items-center justify-center
          hover:scale-105 transition-transform ${
            selected === "Random"
              ? "bg-pink-400 text-black"
              : "bg-[#1e2d5c] text-white"
          }`}
      >
        Random
      </div>

      {multipliers.map((m) => (
        <div
          key={m}
          onClick={() => handleClick(m)}
          className={`flex-1 min-w-0 px-1 py-1 sm:px-2 sm:py-1 md:py-2 rounded-full text-center font-bold text-xs sm:text-sm md:text-base cursor-pointer shadow-md
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
