// src/games/wingo/components/TimeSelector.tsx
import React from "react";
import { FaClock } from "react-icons/fa";

const timeOptions = ["WinGo 30sec", "WinGo 1 Min", "WinGo 3 Min", "WinGo 5 Min"];

interface Props {
  selected: string;
  onSelect: (value: string) => void;
}

const TimeSelector: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
      {timeOptions.map((label) => (
        <div
          key={label}
          onClick={() => onSelect(label)}
          className={`flex flex-col items-center justify-center py-3 rounded-xl cursor-pointer transition-all text-sm font-semibold
            ${
              selected === label
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-[#1e2d5c] text-white"
            }`}
        >
          <FaClock size={18} className="mb-1" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default TimeSelector;
