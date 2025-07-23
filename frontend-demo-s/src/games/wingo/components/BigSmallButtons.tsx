import React, { useState } from "react";

interface Props {
  onSelect: (choice: "big" | "small") => void;
}

const BigSmallButtons: React.FC<Props> = ({ onSelect }) => {
  const [selected, setSelected] = useState<"big" | "small" | null>(null);

  const handleSelect = (choice: "big" | "small") => {
    setSelected(choice);
    onSelect(choice);
  };

  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div
        onClick={() => handleSelect("big")}
        className={`text-white font-bold text-lg py-3 rounded-full text-center cursor-pointer shadow-md transition-transform hover:scale-105 ${
          selected === "big" ? "bg-yellow-400 text-black" : "bg-orange-400"
        }`}
      >
        BIG
      </div>
      <div
        onClick={() => handleSelect("small")}
        className={`text-white font-bold text-lg py-3 rounded-full text-center cursor-pointer shadow-md transition-transform hover:scale-105 ${
          selected === "small" ? "bg-yellow-400 text-black" : "bg-sky-400"
        }`}
      >
        SMALL
      </div>
    </div>
  );
};

export default BigSmallButtons;
