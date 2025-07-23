import { useState } from "react";
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



import { useAuth } from "../../hooks/useAuth";
import { useEffect } from "react";

const WingoGame = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState("");
  const [activeTab, setActiveTab] = useState<"game" | "chart" | "my">("game");
  const [selectedInterval, setSelectedInterval] = useState("WinGo 30sec");

  // Backend data integration
  interface HistoryItem {
    id: string;
    period: string;
    number: number;
    status?: string;
  }
  const [gameHistoryData, setGameHistoryData] = useState<HistoryItem[]>([] as HistoryItem[]);
  const [chartData, setChartData] = useState<any[]>([]); // For now, use same as history
  interface MyHistoryItem {
    id: string;
    period: string;
    betType: string;
    amount: number;
    result?: "Win" | "Lose";
    status?: string;
  }
  const [myHistoryData, setMyHistoryData] = useState<MyHistoryItem[]>([] as MyHistoryItem[]); 


  // Backend-driven round/timer state
  interface Round {
    id: string;
    period: string;
    endTime: string;
    [key: string]: any;
  }
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [roundLoading, setRoundLoading] = useState(false);
  const [roundError, setRoundError] = useState(null);
  const [timerDuration, setTimerDuration] = useState(30);
  const [timerPeriod, setTimerPeriod] = useState("");

  // Backend data integration
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMyHistory, setLoadingMyHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);
  const [errorMyHistory, setErrorMyHistory] = useState<string | null>(null);

  useEffect(() => {
    // Fetch game history
    setLoadingHistory(true);
    fetch("https://rj-755j.onrender.com/api/wingo/history")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch game history");
        const data = await res.json();
        // Map backend data to include status for badge
        const mapped = (Array.isArray(data) ? data : data.history || []).map((item: any, i: number) => ({
          id: item.period || String(i),
          period: item.period,
          number: item.resultNumber,
          status: item.resultNumber == null ? "pending" : "settled",
          ...item,
        }));
        setGameHistoryData(mapped);
        setChartData(mapped);
      })
      .catch((err) => setErrorHistory(err.message || "Error fetching game history"))
      .finally(() => setLoadingHistory(false));
  }, []);

  // Fetch current round info from backend when interval changes
  useEffect(() => {
    let intervalLabel = selectedInterval
      .replace("WinGo ", "")
      .replace("sec", "s")
      .replace("Min", "m")
      .replace(/\s/g, "") // Remove all spaces
      .trim();
    setRoundLoading(true);
    setRoundError(null);
    setCurrentRound(null);
    fetch(`https://rj-755j.onrender.com/api/wingo/round/current?interval=${encodeURIComponent(intervalLabel)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("No current round");
        const round = await res.json();
        setCurrentRound(round);
        setTimerPeriod(round.period || "");
        // Calculate timer duration (seconds left)
        const endTime = new Date(round.endTime).getTime();
        const now = Date.now();
        const diff = Math.floor((endTime - now) / 1000);
        setTimerDuration(diff > 0 ? diff : 0);
      })
      .catch((err) => setRoundError(err.message || "Error fetching round"))
      .finally(() => setRoundLoading(false));
  }, [selectedInterval]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const fetchMyBets = () => {
      if (!user?.id) return;
      setLoadingMyHistory(true);
      fetch(`https://rj-755j.onrender.com/api/wingo/my-bets?userId=${user.id}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch my bet history");
          const data = await res.json();
          // Map status for badge: pending if result is null/undefined
          const mapped: MyHistoryItem[] = Array.isArray(data.bets)
            ? data.bets.map((item: any, i: number) => ({
                ...item,
                id: item.betId !== undefined ? String(item.betId) : item.period !== undefined ? String(item.period) : String(i),
                period: item.period ? String(item.period) : String(i),
                betType: item.betType || '',
                amount: typeof item.amount === 'number' ? item.amount : 0,
                status: item.status === "-" ? "pending" : "settled",
                result: item.status === "Win" ? "Win" : item.status === "Lose" ? "Lose" : undefined,
              })
            )
            : [] as MyHistoryItem[];
          setMyHistoryData(mapped);
        })
        .catch((err) => setErrorMyHistory(err.message || "Error fetching my bet history"))
        .finally(() => setLoadingMyHistory(false));
    };
    fetchMyBets();
    if (user?.id) {
      intervalId = setInterval(fetchMyBets, 10000); // Poll every 10 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user?.id]);

  const handleOpenBet = (option: string) => {
    setSelectedBet(option);
    setIsModalOpen(true);
  };



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
        results={gameHistoryData.slice(0, 5).map((item: any) => item.number)}
        timePeriod={timerPeriod}
        duration={timerDuration}
        roundLoading={roundLoading}
        roundError={roundError}
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
        roundId={currentRound?.id || null}
        onSuccess={() => {
          // Refresh wallet and my bet history after successful bet
          // 1. Dispatch a custom event for WalletCard to refresh
          window.dispatchEvent(new Event("wallet:refresh"));
          // 2. Refresh my bet history
          if (user?.id) {
            setLoadingMyHistory(true);
            fetch(`https://rj-755j.onrender.com/api/wingo/my-bets?userId=${user.id}`)
              .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch my bet history");
                const data = await res.json();
                const mapped: MyHistoryItem[] = Array.isArray(data.bets)
                  ? data.bets.map((item: any, i: number) => ({
                      ...item,
                      id: item.betId !== undefined ? String(item.betId) : item.period !== undefined ? String(item.period) : String(i),
                      period: item.period ? String(item.period) : String(i),
                      betType: item.betType || '',
                      amount: typeof item.amount === 'number' ? item.amount : 0,
                      status: item.status === "-" ? "pending" : "settled",
                      result: item.status === "Win" ? "Win" : item.status === "Lose" ? "Lose" : undefined,
                    })
                  )
                  : [] as MyHistoryItem[];
                setMyHistoryData(mapped);
              })
              .catch((err) => setErrorMyHistory(err.message || "Error fetching my bet history"))
              .finally(() => setLoadingMyHistory(false));
          }
        }}
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
      {activeTab === "game" && (
        <>
          {loadingHistory && <div className="text-gray-400 text-center my-2">Loading game history...</div>}
          {errorHistory && <div className="text-red-400 text-center my-2">{errorHistory}</div>}
          <GameHistoryTable history={gameHistoryData} />
        </>
      )}

      {activeTab === "chart" &&  <GameChart data={chartData} />
      //  (
      //   <div className="bg-[#1e2d5c] text-white p-4 mt-4 rounded-lg">
      //     <h2 className="text-center text-lg font-bold">📈 Chart View Coming Soon</h2>
      //   </div>
      // )
      }

      {activeTab === "my" && (
        <>
          {loadingMyHistory && <div className="text-gray-400 text-center my-2">Loading my bets...</div>}
          {errorMyHistory && <div className="text-red-400 text-center my-2">{errorMyHistory}</div>}
          <MyHistoryTable data={myHistoryData as MyHistoryItem[]} />
        </>
      )}
    </div>
  );
};

export default WingoGame;
