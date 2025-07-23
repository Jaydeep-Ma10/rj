import React from "react";
interface Props {
    selectedInterval: string;
    results: number[];
    timePeriod: string;
    duration: number;
    roundLoading: boolean;
    roundError: string | null;
}
declare const GameHeaderCard: React.FC<Props>;
export default GameHeaderCard;
