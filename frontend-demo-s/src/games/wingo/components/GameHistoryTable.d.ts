import React from "react";
interface HistoryItem {
    id: string;
    period: string;
    number: number;
    status?: string;
}
interface Props {
    history: HistoryItem[];
}
declare const GameHistoryTable: React.FC<Props>;
export default GameHistoryTable;
