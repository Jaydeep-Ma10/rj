import React from "react";

interface MyHistoryItem {
  id: string;
  period: string;
  betType: string; // e.g. "Green", "Digit 5", "BIG"
  amount: number;
  result: "Win" | "Lose";
}

interface Props {
  data: MyHistoryItem[];
}

const MyHistoryTable: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[#1e2d5c] text-white rounded-xl p-4 mt-4">
      <h2 className="text-lg font-bold mb-4">🧾 My Bet History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-auto">
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
                <td
                  className={`py-2 px-3 font-bold ${
                    item.result === "Win" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {item.result}
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
