import React, { useEffect, useState } from "react";

interface Props {
  duration: number;
  timePeriod: string;
}

const CountdownTimer: React.FC<Props> = ({ duration, timePeriod }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : duration));
    }, 1000);
    return () => clearInterval(timer);
  }, [duration]);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)
      .toString()
      .padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  const timeString = formatTime(timeLeft); // e.g., "00:05"

  return (
    <div className="w-1/2 h-[102px] rounded-xl px-3 py-2 flex flex-col justify-center items-end text-right gap-1 font-bold">
      <h2 className="text-white text-xs">Time remaining</h2>

      <div className="flex items-end justify-center gap-1 mb-2">
        {timeString.split("").map((char, index) => (
          <div
            key={index}
            className={`h-8 flex items-center justify-center text-lg font-bold  text-[#F0F1F5] bg-[#2B3270] ${
              char === ":" ? "w-4" : "w-5"
            }`}
          >
            {char}
          </div>
        ))}
      </div>

      {/* Time Period Text */}
      <div className="text-[15px] font-bold text-gray-300">
        <p className="text-white font-semibold">{timePeriod}</p>
      </div>
    </div>
  );
};

export default CountdownTimer;
