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
    `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;

  return (
    <div className="bg-[#1e2d5c] p-3 rounded-lg w-full md:w-1/2 text-center shadow-md">
      <h2 className="text-white text-sm mb-2">⏳ Time Remaining</h2>
      <p className="text-2xl text-yellow-400 font-bold mb-2">
        {formatTime(timeLeft)}
      </p>
      <p className="text-xs text-gray-300">Time Period</p>
      <p className="text-white text-sm font-mono">{timePeriod}</p>
    </div>
  );
};

export default CountdownTimer;
