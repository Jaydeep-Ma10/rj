import React from "react";

interface HistoryItem {
  id: string;
  period: string;
  number: number;
}

const getColor = (num: number) => {
  if (num === 0) return "Red + Violet";
  if (num === 5) return "Green + Violet";
  if ([2, 4, 6, 8].includes(num)) return "Red";
  if ([1, 3, 7, 9].includes(num)) return "Green";
  return "Unknown";
};

const getBigSmall = (num: number) => {
  if ([6, 7, 8, 9].includes(num)) return "Big";
  if ([1, 2, 3, 4].includes(num)) return "Small";
  return "-";
};

interface Props {
  history: HistoryItem[];
}

const GameHistoryTable: React.FC<Props> = ({ history }) => {
  return (
    <div className="bg-[#1e2d5c] text-white rounded-xl p-4 mt-4">
      <h2 className="text-lg font-bold mb-4">📜 Game History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-auto">
          <thead>
            <tr className="bg-[#293b6a] text-white">
              <th className="py-2 px-3 text-left">Period</th>
              <th className="py-2 px-3 text-left">Number</th>
              <th className="py-2 px-3 text-left">Big/Small</th>
              <th className="py-2 px-3 text-left">Color</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-700 hover:bg-[#33416d]"
              >
                <td className="py-2 px-3">{item.period}</td>
                <td className="py-2 px-3 font-bold">{item.number}</td>
                <td className="py-2 px-3">{getBigSmall(item.number)}</td>
                <td className="py-2 px-3">{getColor(item.number)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameHistoryTable;
