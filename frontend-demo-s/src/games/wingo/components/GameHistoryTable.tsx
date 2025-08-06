import React from "react";

interface HistoryItem {
  id: string;
  period: string;
  number: number;
  // status?: string; // 'pending' or 'settled'
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
  if (!history || history.length === 0) {
    return (
      <div className="bg-[#1e2d5c] text-white rounded-xl p-3 sm:p-4 md:p-6 mt-3 md:mt-4">
        <h2 className="text-base md:text-lg lg:text-xl font-bold mb-3 md:mb-4 text-center">🎮 Game History</h2>
        <div className="text-center text-gray-400 py-8">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm md:text-base">No game history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e2d5c] text-white rounded-xl p-3 sm:p-4 md:p-6 mt-3 md:mt-4 shadow-lg">
      {/* <h2 className="text-base md:text-lg lg:text-xl font-bold mb-3 md:mb-4 text-center"> Game History</h2> */}
      
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-2">
        <table className="w-full text-xs sm:text-sm md:text-base table-auto">
          <thead>
            <tr className="bg-[#293b6a] text-white">
              <th className="py-3 px-3 md:px-4 text-left font-semibold rounded-tl-lg">Period</th>
              <th className="py-3 px-3 md:px-4 text-center font-semibold">Number</th>
              <th className="py-3 px-3 md:px-4 text-center font-semibold">Big/Small</th>
              <th className="py-3 px-3 md:px-4 text-center font-semibold rounded-tr-lg">Color</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-gray-700 hover:bg-[#33416d] transition-colors duration-200 ${
                  index === history.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="py-2 px-3 md:px-4 font-mono text-xs md:text-sm">
                  <span className="hidden md:block">{item.period}</span>
                  <span className="block md:hidden">{item.period.slice(-8)}</span>
                </td>
                <td className="py-2 px-3 md:px-4 text-center">
                  <span className="font-bold text-lg md:text-xl text-yellow-400">{item.number}</span>
                </td>
                <td className="py-2 px-3 md:px-4 text-center font-semibold">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    getBigSmall(item.number) === 'Big' 
                      ? 'bg-orange-500/20 text-orange-300' 
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {getBigSmall(item.number)}
                  </span>
                </td>
                <td className="py-2 px-3 md:px-4 text-center font-semibold text-sm">
                  {getColor(item.number)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs sm:text-sm md:text-base table-auto">
          <thead>
            <tr className="bg-[#293b6a] text-white">
              <th className="py-3 px-3 md:px-4 text-left font-semibold rounded-tl-lg">Period</th>
              <th className="py-3 px-3 md:px-4 text-center font-semibold">Number</th>
              <th className="py-3 px-3 md:px-4 text-center font-semibold">Big/Small</th>
              <th className="py-3 px-3 md:px-4 text-center font-semibold rounded-tr-lg">Color</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-gray-700 hover:bg-[#33416d] transition-colors duration-200 ${
                  index === history.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="py-2 px-3 md:px-4 font-mono text-xs md:text-sm">
                  <span className="hidden md:block">{item.period}</span>
                  <span className="block md:hidden">{item.period.slice(-8)}</span>
                </td>
                <td className="py-2 px-3 md:px-4 text-center">
                  <span className="font-bold text-lg md:text-xl text-yellow-400">{item.number}</span>
                </td>
                <td className="py-2 px-3 md:px-4 text-center font-semibold">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    getBigSmall(item.number) === 'Big' 
                      ? 'bg-orange-500/20 text-orange-300' 
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {getBigSmall(item.number)}
                  </span>
                </td>
                <td className="py-2 px-3 md:px-4 text-center font-semibold text-sm">
                  {getColor(item.number)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameHistoryTable;
