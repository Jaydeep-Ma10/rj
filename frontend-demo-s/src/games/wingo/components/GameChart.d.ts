import React from "react";
interface ChartItem {
    id: string;
    number: number;
    period: string;
}
interface Props {
    data: ChartItem[];
}
declare const GameChart: React.FC<Props>;
export default GameChart;
