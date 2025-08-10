import React from "react";

interface BetOptionsProps {
  onSelect: (color: "green" | "red" | "violet") => void;
}

const BetOptions: React.FC<BetOptionsProps> = ({ onSelect }) => {
  const colors = [
    { label: "Green", value: "green", className: "bg-[#17B15E] rounded-tl-none rounded-br-none" },
    { label: "Violet", value: "violet", className: "bg-[#9B48DB]" },
    { label: "Red", value: "red", className: "bg-[#D23838] rounded-tr-none rounded-bl-none" },
  ];

  return (
    <div className="w-full flex justify-center px-4 gap-2 md:gap-4 mt-2 md:mt-4">
      {colors.map((btn) => (
        <div
          key={btn.value}
          onClick={() => onSelect(btn.value as "green" | "red" | "violet")}
          className={`flex-1 text-white text-center py-2 md:py-2 px-4 rounded-lg text-base md:text-lg shadow-md cursor-pointer transition-transform hover:scale-105 ${btn.className}`}
        >
          {btn.label}
        </div>
      ))}
    </div>
  );
};

export default BetOptions;
