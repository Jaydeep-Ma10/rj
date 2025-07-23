import React from "react";
interface MyHistoryItem {
    id: string;
    period: string;
    betType: string;
    amount: number;
    result?: "Win" | "Lose";
    status?: string;
}
interface Props {
    data: MyHistoryItem[];
}
declare const MyHistoryTable: React.FC<Props>;
export default MyHistoryTable;
