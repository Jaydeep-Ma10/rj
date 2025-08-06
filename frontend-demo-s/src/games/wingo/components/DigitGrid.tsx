import React from "react";
import { getDigitStyle } from "@/utils/styles";

interface Props {
  onSelectDigit: (digit: number) => void;
}

const DigitGrid: React.FC<Props> = ({ onSelectDigit }) => {
  const digits = Array.from({ length: 10 }, (_, i) => i);

  // const getDigitStyle = (digit: number) => {
  //   if (digit === 0) {
  //     return {
  //       background: "linear-gradient(135deg, #ef4444 50%, #8b5cf6 50%)",
  //       textColor: "#ef4444"
  //     };
  //   } else if (digit === 5) {
  //     return {
  //       background: "linear-gradient(135deg, #22c55e 50%, #8b5cf6 50%)",
  //       textColor: "#22c55e"
  //     };
  //   } else if ([2, 4, 6, 8].includes(digit)) {
  //     return {
  //       background: "#ef4444",
  //       textColor: "#ef4444"
  //     };
  //   } else if ([1, 3, 7, 9].includes(digit)) {
  //     return {
  //       background: "#22c55e",
  //       textColor: "#22c55e"
  //     };
  //   } else {
  //     return {
  //       background: "#4b5563",
  //       textColor: "#4b5563"
  //     };
  //   }
  // };

  return (
    <div className="bg-[#22275B] grid grid-cols-5 p-2 gap-2 rounded-md">
      {digits.map((digit) => {
        const style = getDigitStyle(digit);
        return (
          <div
            key={digit}
            onClick={() => onSelectDigit(digit)}
            className="relative w-14 h-14 rounded-full cursor-pointer hover:scale-105 transition-transform"
            style={{ background: style.background  }}
          >
            <div className="absolute inset-[20%] rounded-full bg-white z-10 shadow-inner overflow-hidden">
              <div className={`absolute bottom-0 left-0 w-full h-1/2 rounded-b-full`} />
            </div>
            {[
              { top: "0px", left: "50%", transform: "translateX(-50%)" }, // Top
              { bottom: "0px", left: "50%", transform: "translateX(-50%)" }, // Bottom
              { left: "-2px", top: "50%", transform: "translateY(-50%) rotate(90deg)" }, // Left
              { right: "-2px", top: "50%", transform: "translateY(-50%) rotate(90deg)" }, // Right
            ].map((pos, idx) => (
              <div
                key={idx}
                className="absolute w-3 h-1.5 rounded-full bg-white z-20"
                style={{
                  ...pos,
                }}
              />
            ))}
            <span
              className="absolute top-1/2 left-1/2 text-2xl font-bold z-30"
              style={{
                color: style.textColor,
                transform: "translate(-50%, -50%)",
              }}
            >
              {digit}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default DigitGrid;
