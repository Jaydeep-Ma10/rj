import React from "react";
import { MdLibraryBooks } from "react-icons/md";
import { getDigitStyle } from "@/utils/styles"; // adjust path as needed

interface Props { 
  selectedInterval: string;
  results: number[];
}

const HowToPlayCard: React.FC<Props> = ({ selectedInterval, results }) => {
  return (
    <div className="rounded-xl px-3 py-2 w-1/2 flex flex-col justify-between gap-1">
      <div className="flex justify-center py-[3.5px] items-center gap-1 mb-2 border-[0.2px] border-gray-900 rounded-2xl">
        <MdLibraryBooks className="text-white text-sm" />
        <h2 className="text-white text-xs font-normal">How to Play</h2>
      </div>

      <p className="text-xs text-gray-300 text-left font-semibold mb-1">{selectedInterval}</p>

      <div className="flex gap-2">
        {results.slice(0, 5).map((digit, index) => {
          const style = getDigitStyle(digit);
          return (
            <div
              key={index}
              className="relative w-6 h-6 rounded-full"
              style={{ background: style.background }}
            >
              {/* Inner white circle */}
              <div className="absolute inset-[15%] rounded-full bg-white z-10 shadow-inner overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1/2 rounded-b-full" />
              </div>

              {/* Ticks */}
              {[
                { top: "0px", left: "50%", transform: "translateX(-50%)" },
                { bottom: "0px", left: "50%", transform: "translateX(-50%)" },
                { left: "-1px", top: "50%", transform: "translateY(-50%) rotate(90deg)" },
                { right: "-1px", top: "50%", transform: "translateY(-50%) rotate(90deg)" },
              ].map((pos, idx) => (
                <div
                  key={idx}
                  className="absolute w-[6px] h-[3px] rounded-full bg-white z-20"
                  style={pos}
                />
              ))}

              {/* Digit */}
              <span
                className="absolute top-1/2 left-1/2 text-[9px] font-bold z-30"
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
    </div>
  );
};

export default HowToPlayCard;
