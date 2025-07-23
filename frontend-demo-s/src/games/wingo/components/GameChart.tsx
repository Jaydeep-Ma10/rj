import React from "react";

interface ChartItem {
  id: string;
  number: number;
  period: string;
}

interface Props {
  data: ChartItem[];
}

const getColorClass = (num: number) => {
  if (num === 0) return "bg-gradient-to-r from-red-500 to-purple-500 text-white";
  if (num === 5) return "bg-gradient-to-r from-green-500 to-purple-500 text-white";
  if ([2, 4, 6, 8].includes(num)) return "bg-red-500 text-white";
  if ([1, 3, 7, 9].includes(num)) return "bg-green-500 text-white";
  return "bg-gray-500 text-white";
};

const GameChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[#1e2d5c] p-4 mt-4 rounded-xl text-white">
      <h2 className="text-lg font-bold mb-4">📊 Recent Results Chart</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {data.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col items-center justify-center min-w-[60px] rounded-full w-[60px] h-[60px] ${getColorClass(
              item.number
            )}`}
          >
            <div className="text-xl font-bold">{item.number}</div>
            <div className="text-[10px] mt-1 opacity-70">{item.period.slice(-6)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameChart;
