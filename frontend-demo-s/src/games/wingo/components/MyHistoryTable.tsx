import React from "react";

interface MyHistoryItem {
  id: string;
  period: string;
  betType: string; // e.g. "Green", "Digit 5", "BIG"
  amount: number;
  result?: "Win" | "Lose";
  status?: string; // 'pending' or 'settled'
}

interface Props {
  data: MyHistoryItem[];
}

const MyHistoryTable: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[#1e2d5c] text-white rounded-xl p-1 sm:p-2 md:p-4 mt-2 md:mt-4">
      <h2 className="text-base md:text-lg font-bold mb-2 md:mb-4"> My Bet History</h2>
      <div className="overflow-x-auto gap-2 md:gap-4">
        <table className="w-full min-w-[320px] sm:min-w-[400px] text-[11px] sm:text-xs md:text-sm table-auto">
          <thead>
            <tr className="bg-[#293b6a] text-white">
              <th className="py-2 px-3 text-left">Period</th>
              <th className="py-2 px-3 text-left">Bet Type</th>
              <th className="py-2 px-3 text-left">Amount</th>
              <th className="py-2 px-3 text-left">Result</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-700 hover:bg-[#33416d]"
              >
                <td className="py-2 px-3">{item.period}</td>
                <td className="py-2 px-3 font-semibold">{item.betType}</td>
                <td className="py-2 px-3">₹{item.amount}</td>
                <td className="py-2 px-3 font-bold">
                  {item.status === "pending" ? (
                    <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">Pending</span>
                  ) : item.result === "Win" ? (
                    <span className="text-green-400">Win</span>
                  ) : item.result === "Lose" ? (
                    <span className="text-red-400">Lose</span>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyHistoryTable;
