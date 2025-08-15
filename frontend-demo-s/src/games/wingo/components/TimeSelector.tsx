import React from "react";
import { clock, nonClock } from "@/assets/images";


const timeOptions = ["WinGo 30sec", "WinGo 1min", "WinGo 3min", "WinGo 5min", "WinGo 10min"];

interface Props {
  selected: string;
  onSelect: (value: string) => void;
}

const TimeSelector: React.FC<Props> = ({ selected, onSelect }) => {
  console.log(selected);
  return (
    <div className="flex justify-center items-center mt-3 w-full bg-[#374992] rounded-xl">
      {timeOptions.map((label) => (
        <div
          key={label}
          onClick={() => onSelect(label)}
          className={`flex flex-col items-center justify-center flex-1 h-24 cursor-pointer transition-all text-sm font-semibold 
    ${
      selected === label
        ? "bg-[linear-gradient(180deg,_#2AAAF3_0%,_#2979F2_100%)] text-white shadow-lg rounded-xl"
        : "text-gray-400 bg-transparent"
    }`}
        >
          <img src={selected === label ? clock : nonClock} className="w-10 h-10" />
          <span className="text-xs font-Bold leading-tight w-10">
          {label.replace("WinGo ", "")}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TimeSelector;