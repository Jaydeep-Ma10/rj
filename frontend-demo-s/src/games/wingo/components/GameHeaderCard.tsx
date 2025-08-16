import React from "react";
import HowToPlayCard from "./HowToPlayCard";
import CountdownTimer from "./CountdownTimer";
import { bgImageGame } from "@/assets/images";

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
    <>
      <div className="px-[13px]">
        <div className="relative w-full md:mt-4 md:min-h-[250px] rounded-xl overflow-hidden">
          <img
            src={bgImageGame}
            alt="Game background"
            className="absolute inset-0 w-full h-full"
          />

          <div className="absolute inset-0backdrop-blur-[1px]" />

          <div className="relative z-10 flex md:flex-row gap-2 md:gap-3 h-full">
            <HowToPlayCard
              selectedInterval={selectedInterval}
              results={results}
            />

            {roundLoading ? (
              <div className="p-2 md:p-3 rounded-lg w-full md:w-1/2 text-center flex items-center justify-center min-h-[70px] md:min-h-[90px]">
                <span className="text-yellow-400 font-bold text-sm md:text-base">
                  Loading round...
                </span>
              </div>
            ) : roundError ? (
              <div className="p-2 md:p-3 rounded-lg w-full md:w-1/2 text-center flex items-center justify-center min-h-[70px] md:min-h-[90px]">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                  <span className="text-yellow-400 font-bold text-sm md:text-base">
                    {roundError}
                  </span>
                </div>
              </div>
            ) : (
              <CountdownTimer duration={duration} timePeriod={timePeriod} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GameHeaderCard;
