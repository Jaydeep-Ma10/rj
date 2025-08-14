import React, { useState } from "react";

interface HistoryItem {
  id: string;
  period: string;
  serialNumber?: string;
  number: number;
}

const ITEMS_PER_PAGE = 10;
const TOTAL_PAGES = 50;

const getColor = (num: number) => {
  if (num === 0) return "Red + Violet";
  if (num === 5) return "Green + Violet";
  if ([2, 4, 6, 8].includes(num)) return "Red";
  if ([1, 3, 7, 9].includes(num)) return "Green";
  return "Unknown";
};

const getColorClasses = (num: number): string[] => {
  const color = getColor(num);
  switch (color) {
    case "Red + Violet":
      return ["bg-red-500", "bg-violet-500"];
    case "Green + Violet":
      return ["bg-green-500", "bg-violet-500"];
    case "Red":
      return ["bg-red-500"];
    case "Green":
      return ["bg-green-500"];
    default:
      return ["bg-gray-400"];
  }
};

const getNumberGradientClass = (num: number): string => {
  const color = getColor(num);
  switch (color) {
    case "Red + Violet":
      return "bg-gradient-to-b from-red-500 to-violet-500 text-transparent bg-clip-text";
    case "Green + Violet":
      return "bg-gradient-to-b from-green-500 to-violet-500 text-transparent bg-clip-text";
    case "Red":
      return "text-red-500";
    case "Green":
      return "text-green-500";
    default:
      return "text-gray-400";
  }
};

const getBigSmall = (num: number) => {
  if ([5, 6, 7, 8, 9].includes(num)) return "Big";
  if ([1, 2, 3, 4, 5].includes(num)) return "Small";
  return "-";
};

interface Props {
  history: HistoryItem[];
}

const GameHistoryTable: React.FC<Props> = ({ history }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Paginate the history - show max 500 entries
  const paginatedHistory = history.slice(0, ITEMS_PER_PAGE * TOTAL_PAGES);
  const totalPages = Math.ceil(paginatedHistory.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = paginatedHistory.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const goPrev = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goNext = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  if (!history || history.length === 0) {
    return (
      <div className="bg-[#1e2d5c] text-white rounded-xl p-3 sm:p-4 md:p-6 mt-3 md:mt-4">
        <h2 className="text-base md:text-lg lg:text-xl font-bold mb-3 md:mb-4 text-center">
          🎮 Game History
        </h2>
        <div className="text-center text-gray-400 py-8">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm md:text-base">No game history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2B3270] text-white rounded-xl mx-4 sm:p-4 md:p-6 mt-3 md:mt-4 shadow-lg pb-16">
      {/* Table Views */}
      <div className="block sm:hidden">
        <table className="w-full text-xs sm:text-sm md:text-base table-auto">
          <thead>
            <tr className="bg-[#374992] text-white">
              <th className="py-3 px-3 text-center font-semibold">Period</th>
              <th className="py-3 px-3 text-center font-semibold">Number</th>
              <th className="py-3 px-3 text-center font-semibold">Big/Small</th>
              <th className="py-3 px-3 text-center font-semibold">Color</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-700 hover:bg-[#33416d]">
                <td className="py-2 px-3 text-left text-xs font-mono">
                  {new Date().toISOString()
                    .replace(/[-:T.]/g, '')
                    .slice(0, 17)}
                  {item.serialNumber || item.period}
                </td>
                <td className="py-2 px-3 text-center">
                  <span className={`font-bold text-lg ${getNumberGradientClass(item.number)}`}>
                    {item.number}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      getBigSmall(item.number) === "Big"
                        ? "bg-orange-500/20 text-orange-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {getBigSmall(item.number)}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <div className="flex justify-center items-center space-x-1">
                    {getColorClasses(item.number).map((cls, idx) => (
                      <div key={idx} className={`w-3.5 h-3.5 rounded-full ${cls}`} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm md:text-base table-auto">
          <thead>
            <tr className="bg-[#293b6a] text-white">
              <th className="py-3 px-4 text-left font-semibold">Period</th>
              <th className="py-3 px-4 text-center font-semibold">Number</th>
              <th className="py-3 px-4 text-center font-semibold">Big/Small</th>
              <th className="py-3 px-4 text-center font-semibold">Color</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-700 hover:bg-[#33416d]">
                <td className="py-2 px-4 font-mono text-sm md:text-base">
                  {new Date().toISOString()
                    .replace(/[-:T.]/g, '')
                    .slice(0, 17)}
                  {item.serialNumber || item.period}
                </td>
                <td className="py-2 px-4 text-center">
                  <span className={`font-bold text-lg md:text-xl ${getNumberGradientClass(item.number)}`}>
                    {item.number}
                  </span>
                </td>
                <td className="py-2 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      getBigSmall(item.number) === "Big"
                        ? "bg-orange-500/20 text-orange-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {getBigSmall(item.number)}
                  </span>
                </td>
                <td className="py-2 px-4 text-center">
                  <div className="flex justify-center items-center space-x-1">
                    {getColorClasses(item.number).map((cls, idx) => (
                      <div key={idx} className={`w-3.5 h-3.5 rounded-full ${cls}`} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <div className="flex justify-center items-center mb-4 text-sm md:text-base font-semibold space-x-4 mt-4">
        <button
          onClick={goPrev}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded ${
            currentPage === 1 ? "opacity-50 bg-[#2B3270] cursor-not-allowed" : "bg-[#61a9ff] hover:bg-[#3b478c]"
          }`}
        >
          &lt;
        </button>
        <span>
          Page {currentPage} / {Math.min(totalPages, TOTAL_PAGES)}
        </span>
        <button
          onClick={goNext}
          disabled={currentPage === totalPages || currentPage === TOTAL_PAGES}
          className={`px-2 py-1 rounded ${
            currentPage === totalPages || currentPage === TOTAL_PAGES
              ? "opacity-50 bg-[#2B3270] cursor-not-allowed"
              : "hover:bg-[#3b478c] bg-[#61a9ff]"
          }`}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default GameHistoryTable;
