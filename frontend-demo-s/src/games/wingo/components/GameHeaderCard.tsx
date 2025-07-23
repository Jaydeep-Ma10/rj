import React from "react";
import HowToPlayCard from "./HowToPlayCard";
import CountdownTimer from "./CountdownTimer";

interface Props {
  selectedInterval: string;
  results: number[];
  timePeriod: string;
}

const GameHeaderCard: React.FC<Props> = ({
  selectedInterval,
  results,
  timePeriod,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 mt-4">
      <HowToPlayCard selectedInterval={selectedInterval} results={results} />
      <CountdownTimer duration={30} timePeriod={timePeriod} />
    </div>
  );
};

export default GameHeaderCard;
