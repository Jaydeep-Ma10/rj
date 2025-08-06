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
    <div className="flex justify-center items-center mt-6 shadow-md w-full pb-2 px-4">
      <button
        onClick={() => handleSelect("big")}
        className={`w-full px-6 py-2 text-white font-bold text-base text-center cursor-pointer transition-transform hover:scale-105 ${
          selected === "big" ? "bg-[#DD9138]" : "bg-[#DD9138]"
        } rounded-l-full`}
      >
        BIG
      </button>
      <button
        onClick={() => handleSelect("small")}
        className={`w-full px-6 py-2 text-white font-bold text-base text-center cursor-pointer transition-transform hover:scale-105 ${
          selected === "small" ? "bg-[#5088D3]" : "bg-[#5088D3]"
        } rounded-r-full`}
      >
        SMALL
      </button>
    </div>
  );
};

export default BigSmallButtons;
