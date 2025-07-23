import React from "react";
import HowToPlayCard from "./HowToPlayCard";
import CountdownTimer from "./CountdownTimer";

interface Props {
  selectedInterval: string;
  results: number[];
  timePeriod: string;
  duration: number;
  roundLoading: boolean;
  roundError: string | null;
}

const GameHeaderCard: React.FC<Props> = ({
  selectedInterval,
  results,
  timePeriod,
  duration,
  roundLoading,
  roundError,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 mt-4">
      <HowToPlayCard selectedInterval={selectedInterval} results={results} />
      {roundLoading ? (
        <div className="bg-[#1e2d5c] p-3 rounded-lg w-full md:w-1/2 text-center shadow-md flex items-center justify-center min-h-[90px]">
          <span className="text-yellow-400 font-bold">Loading round...</span>
        </div>
      ) : roundError ? (
        <div className="bg-[#1e2d5c] p-3 rounded-lg w-full md:w-1/2 text-center shadow-md flex items-center justify-center min-h-[90px]">
          <span className="text-red-400 font-bold">{roundError}</span>
        </div>
      ) : (
        <CountdownTimer duration={duration} timePeriod={timePeriod} />
      )}
    </div>
  );
};

export default GameHeaderCard;
