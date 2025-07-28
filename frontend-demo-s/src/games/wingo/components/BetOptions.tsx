import React from "react";

interface BetOptionsProps {
  onSelect: (color: "green" | "red" | "violet") => void;
}

const BetOptions: React.FC<BetOptionsProps> = ({ onSelect }) => {
  const colors = [
    { label: "Green", value: "green", className: "bg-green-500" },
    { label: "Violet", value: "violet", className: "bg-purple-500" },
    { label: "Red", value: "red", className: "bg-red-500" },
  ];

  return (
    <div className="w-full grid grid-cols-3 gap-2 md:gap-4 mt-2 md:mt-4">
      {colors.map((btn) => (
        <div
          key={btn.value}
          onClick={() => onSelect(btn.value as "green" | "red" | "violet")}
          className={`text-white text-center py-1 md:py-2 rounded-xl text-base md:text-lg font-semibold shadow-md cursor-pointer transition-transform hover:scale-105 ${btn.className}`}
        >
          {btn.label}
        </div>
      ))}
    </div>
  );
};

export default BetOptions;
