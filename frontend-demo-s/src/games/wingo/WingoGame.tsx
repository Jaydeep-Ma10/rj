import React, { useState } from "react";
import HeaderBar from "./components/HeaderBar";
import WalletCard from "./components/WalletCard";
import AdBanner from "./components/AdBanner";
import TimeSelector from "./components/TimeSelector";
import GameHeaderCard from "./components/GameHeaderCard";
import BetOptions from "./components/BetOptions";
import DigitGrid from "./components/DigitGrid";
import MultiplierGrid from "./components/MultiplierGrid";
import BigSmallButtons from "./components/BigSmallButtons";
import BetModal from "./components/BetModal";
import GameHistoryTable from "./components/GameHistoryTable";
import GameChart from "./components/GameChart";
import MyHistoryTable from "./components/MyHistoryTable";



const WingoGame = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState("");
  const [activeTab, setActiveTab] = useState<"game" | "chart" | "my">("game");

  const handleOpenBet = (option: string) => {
    setSelectedBet(option);
    setIsModalOpen(true);
  };

  const [selectedInterval, setSelectedInterval] = useState("WinGo 30sec");


  const gameHistoryData = [
    { id: "1", period: "20250723100030175", number: 0 },
    { id: "2", period: "20250723100028175", number: 7 },
    { id: "3", period: "20250723100026175", number: 4 },
    { id: "4", period: "20250723100024175", number: 5 },
  ];
  const chartData = [
  { id: "1", period: "20250723100030175", number: 0 },
  { id: "2", period: "20250723100028175", number: 7 },
  { id: "3", period: "20250723100026175", number: 4 },
  { id: "4", period: "20250723100024175", number: 5 },
  { id: "5", period: "20250723100022175", number: 9 },
];

const myHistoryData = [
  { id: "1", period: "20250723100030175", betType: "Green", amount: 100, result: "Win" },
  { id: "2", period: "20250723100028175", betType: "Digit 7", amount: 50, result: "Lose" },
  { id: "3", period: "20250723100026175", betType: "BIG", amount: 200, result: "Win" },
];



  return (
    <div className="min-h-screen bg-[#121d45] p-4 space-y-4">
      <HeaderBar />
      <WalletCard />
      <AdBanner />
      {/* <TimeSelector /> */}
      <TimeSelector
  selected={selectedInterval}
  onSelect={(label) => setSelectedInterval(label)}
/>


      <GameHeaderCard
        selectedInterval={selectedInterval}
        results={[4, 2, 9, 0, 5]}
        timePeriod="20250723100030175"
      />

     <div className="bg-[#1e2d5c] p-4 rounded-xl shadow-md space-y-6 mt-4"> <BetOptions onSelect={(color) => handleOpenBet(color)} />

      <DigitGrid onSelectDigit={(digit) => handleOpenBet(`Digit ${digit}`)} />

     <MultiplierGrid
  onSelect={(value) => {
    if (value === "Random") {
      handleOpenBet("Random"); // Open modal with Random
    } else {
      console.log("Multiplier selected:", value); // or use it for other logic
    }
  }}
/>


      <BigSmallButtons
        onSelect={(value) => handleOpenBet(value.toUpperCase())}
      /></div>

      <BetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedOption={selectedBet}
      />

      {/* Tab Switcher Buttons */}
      <div className="flex justify-around mt-6">
        <button
          onClick={() => setActiveTab("game")}
          className={`text-sm px-4 py-2 rounded-full font-semibold ${
            activeTab === "game"
              ? "bg-yellow-400 text-black"
              : "bg-gray-600 text-white"
          }`}
        >
          Game History
        </button>

        <button
          onClick={() => setActiveTab("chart")}
          className={`text-sm px-4 py-2 rounded-full font-semibold ${
            activeTab === "chart"
              ? "bg-yellow-400 text-black"
              : "bg-gray-600 text-white"
          }`}
        >
          Chart
        </button>

        <button
          onClick={() => setActiveTab("my")}
          className={`text-sm px-4 py-2 rounded-full font-semibold ${
            activeTab === "my"
              ? "bg-yellow-400 text-black"
              : "bg-gray-600 text-white"
          }`}
        >
          My History
        </button>
      </div>

      {/* Conditionally Rendered Sections */}
      {activeTab === "game" && <GameHistoryTable history={gameHistoryData} />}

      {activeTab === "chart" &&  <GameChart data={chartData} />
      //  (
      //   <div className="bg-[#1e2d5c] text-white p-4 mt-4 rounded-lg">
      //     <h2 className="text-center text-lg font-bold">📈 Chart View Coming Soon</h2>
      //   </div>
      // )
      }

      {activeTab === "my" && <MyHistoryTable data={myHistoryData} />
      
      
        // <div className="bg-[#1e2d5c] text-white p-4 mt-4 rounded-lg">
        //   <h2 className="text-center text-lg font-bold">🧾 My History Coming Soon</h2>
        // </div>
      }
    </div>
  );
};

export default WingoGame;
