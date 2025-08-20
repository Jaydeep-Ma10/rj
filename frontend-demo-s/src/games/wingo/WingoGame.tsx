import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getSocket } from "../../utils/socket";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import api from "../../utils/api";
import WalletCard from "./components/WalletCard";
import BetModal from "./components/BetModal";
import GameHistoryTable from "./components/GameHistoryTable";
import MyHistoryTable from "./components/MyHistoryTable";
import BetOptions from "./components/BetOptions";
import DigitGrid from "./components/DigitGrid";
import MultiplierGrid from "./components/MultiplierGrid";
import BigSmallButtons from "./components/BigSmallButtons";
import GameChart from "./components/GameChart";
import HeaderBar from "./components/HeaderBar";
import TimeSelector from "./components/TimeSelector";
import AdBanner from "./components/AdBanner";
import GameHeaderCard from "./components/GameHeaderCard";

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
  const [gameHistoryData, setGameHistoryData] = useState<HistoryItem[]>(
    [] as HistoryItem[]
  );
  const [chartData, setChartData] = useState<any[]>([]); // For now, use same as history
  interface MyHistoryItem {
    id: string;
    period: string;
    betType: string;
    amount: number;
    multiplier?: number;
    result?: "Win" | "Lose";
    status?: "pending" | "settled";
    resultNumber?: number;
    createdAt?: string;
  }
  const [myHistoryData, setMyHistoryData] = useState<MyHistoryItem[]>(
    [] as MyHistoryItem[]
  );

  // Backend-driven round/timer state
  interface Round {
    id: string;
    period: string;
    endTime: string;
    [key: string]: any;
  }
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [roundLoading, setRoundLoading] = useState(false);
  const [roundError, setRoundError] = useState<string | null>(null);
  const [timerDuration, setTimerDuration] = useState(30);
  const [timerPeriod, setTimerPeriod] = useState("");

  // Backend data integration
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMyHistory, setLoadingMyHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);
  const [errorMyHistory, setErrorMyHistory] = useState<string | null>(null);

  useEffect(() => {
    // Fetch game history for the selected interval
    setLoadingHistory(true);
    const interval = selectedInterval
      .replace("WinGo ", "")
      .replace("sec", "s")
      .replace("min", "m")
      .replace(/\s/g, "")
      .trim();

    fetch(buildApiUrl(API_ENDPOINTS.WINGO_HISTORY(interval)))
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch game history");
        const data = await res.json();
        // Map backend data to include status for badge
        const mapped = (Array.isArray(data) ? data : data.history || []).map(
          (item: any, i: number) => ({
            id:
              item.interval && item.serialNumber
                ? `${item.interval}-${item.serialNumber}`
                : item.period || String(i),
            period:
              item.interval && item.serialNumber
                ? `${item.interval}-${item.serialNumber}`
                : item.period || String(i),
            number: item.resultNumber,
            status: item.resultNumber == null ? "pending" : "settled",
            ...item,
          })
        );
        setGameHistoryData(mapped);
        setChartData(mapped);
      })
      .catch((err) =>
        setErrorHistory(err.message || "Error fetching game history")
      )
      .finally(() => setLoadingHistory(false));
  }, [selectedInterval]); // Add selectedInterval to refresh history when interval changes

  // Function to fetch current round with retry logic
  const fetchCurrentRound = async (intervalLabel: string, retryCount = 0) => {
    const maxRetries = 5;
    setRoundLoading(true);
    setRoundError(null);
    
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.WINGO_CURRENT_ROUND(intervalLabel)));
      
      if (!res.ok) {
        if (res.status === 404 && retryCount < maxRetries) {
          // No current round found, retry after delay
          console.log(`🔄 No current round found, retrying in 2 seconds... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            fetchCurrentRound(intervalLabel, retryCount + 1);
          }, 2000);
          return;
        }
        throw new Error("No current round available");
      }
      
      const round = await res.json();
      setCurrentRound(round);
      setTimerPeriod(round.period || "");
      
      // Calculate timer duration (seconds left)
      const endTime = new Date(round.endTime).getTime();
      const now = Date.now();
      const diff = Math.floor((endTime - now) / 1000);
      setTimerDuration(diff > 0 ? diff : 0);
      
      console.log(`✅ Round loaded: ${round.period}, Duration: ${diff}s`);
    } catch (err: any) {
      console.error('❌ Error fetching round:', err.message);
      if (retryCount >= maxRetries) {
        setRoundError("Waiting for new round...");
        // Keep trying every 5 seconds
        setTimeout(() => {
          fetchCurrentRound(intervalLabel, 0);
        }, 5000);
      }
    } finally {
      if (retryCount === 0) {
        setRoundLoading(false);
      }
    }
  };

  // Fetch current round info from backend when interval changes
  useEffect(() => {
    let intervalLabel = selectedInterval
      .replace("WinGo ", "")
      .replace("sec", "s")
      .replace("min", "m") // Fixed: lowercase "min" not "Min"
      .replace(/\s/g, "") // Remove all spaces
      .trim();
    setCurrentRound(null);
    fetchCurrentRound(intervalLabel);
  }, [selectedInterval]);

  // Socket.IO real-time timer synchronization
  useEffect(() => {
    const socket = getSocket();
    
    const handleRoundCreated = (data: any) => {
      const currentInterval = selectedInterval
        .replace("WinGo ", "")
        .replace("sec", "s")
        .replace("min", "m")
        .replace(/\s/g, "")
        .trim();
        
      // Only update if this is for the current interval
      if (data.interval === currentInterval) {
        console.log('🎉 New round received via Socket.IO:', data);
        setCurrentRound(data.round);
        setTimerPeriod(data.round.period || "");
        setTimerDuration(data.timeRemaining > 0 ? data.timeRemaining : 0);
        setRoundError(null);
      }
    };
    
    const handleRoundSettled = (data: any) => {
      console.log('⚡ Round settled via Socket.IO:', data);
      // Refresh game history when round settles
      const interval = selectedInterval
        .replace("WinGo ", "")
        .replace("sec", "s")
        .replace("min", "m")
        .replace(/\s/g, "")
        .trim();
      
      // Fetch updated history
      fetch(buildApiUrl(API_ENDPOINTS.WINGO_HISTORY(interval)))
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            const mapped = (Array.isArray(data) ? data : data.history || []).map(
              (item: any, i: number) => ({
                id: item.interval && item.serialNumber
                  ? `${item.interval}-${item.serialNumber}`
                  : item.period || String(i),
                period: item.interval && item.serialNumber
                  ? `${item.interval}-${item.serialNumber}`
                  : item.period || String(i),
                number: item.resultNumber,
                status: item.resultNumber == null ? "pending" : "settled",
                ...item,
              })
            );
            setGameHistoryData(mapped);
            setChartData(mapped);
          }
        })
        .catch(console.error);
    };
    
    socket.on('round:created', handleRoundCreated);
    socket.on('round:settled', handleRoundSettled);
    
    return () => {
      socket.off('round:created', handleRoundCreated);
      socket.off('round:settled', handleRoundSettled);
    };
  }, [selectedInterval]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const fetchMyBets = async () => {
      if (!user?.id) return;
      setLoadingMyHistory(true);
      try {
        const response = await api.get(`/wingo/my-bets?userId=${user.id}`);
        const data = response.data;
        // Map status for badge: pending if result is null/undefined
        const mapped: MyHistoryItem[] = Array.isArray(data)
          ? data.map((item: any, i: number) => ({
              id:
                item.betId !== undefined
                  ? String(item.betId)
                  : item.interval && item.serialNumber
                  ? `${item.interval}-${item.serialNumber}`
                  : item.period !== undefined
                  ? String(item.period)
                  : String(i),
              period:
                item.interval && item.serialNumber
                  ? `${item.interval}-${item.serialNumber}`
                  : item.period
                  ? String(item.period)
                  : String(i),
              betType: item.betValue || item.betType || item.type || "",
              amount: typeof item.amount === "number" ? item.amount : 0,
              multiplier:
                typeof item.multiplier === "number"
                  ? item.multiplier
                  : undefined,
              status:
                item.status === "-" || item.status === "pending"
                  ? "pending"
                  : "settled",
              result:
                item.status === "Win" || item.result === "Win" || item.win === true
                  ? "Win"
                  : item.status === "Lose" || item.result === "Lose" || item.win === false
                  ? "Lose"
                  : undefined,
              resultNumber:
                typeof item.resultNumber === "number"
                  ? item.resultNumber
                  : undefined,
              createdAt:
                item.createdAt || item.timestamp || new Date().toISOString(),
              ...(item.type === "color" && { betType: item.value }),
              ...(item.type === "number" && { betType: `Digit ${item.value}` }),
              ...(item.type === "bigSmall" && {
                betType: item.value.toUpperCase(),
              }),
            }))
          : ([] as MyHistoryItem[]);
        setMyHistoryData(mapped);
      } catch (err: any) {
        setErrorMyHistory(
          err.response?.data?.error ||
            err.message ||
            "Error fetching my bet history"
        );
        console.error("Error fetching bet history:", err);
      } finally {
        setLoadingMyHistory(false);
      }
    };
    fetchMyBets();
    if (user?.id) {
      intervalId = setInterval(fetchMyBets, 10000); // Poll every 10 seconds
    }

    // --- Socket.IO real-time update integration ---
    const socket = getSocket();
    const handleBetUpdate = () => {
      fetchMyBets();
    };
    socket.on("bet:update", handleBetUpdate);
    socket.on("round:settled", handleBetUpdate);

    return () => {
      if (intervalId) clearInterval(intervalId);
      socket.off("bet:update", handleBetUpdate);
      socket.off("round:settled", handleBetUpdate);
    };
  }, [user?.id]);

  const handleOpenBet = (option: string) => {
    setSelectedBet(option);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen sm:p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 lg:space-y-6 w-[100vw]">
      <div className="px-[13px] bg-[#2B3270] rounded-b-[6rem] mb-5">
        <HeaderBar />
        <WalletCard />
        <AdBanner />
        <TimeSelector
          selected={selectedInterval || "30sec"}
          onSelect={(label) => setSelectedInterval(label)}
        />
      </div>

      <GameHeaderCard
        selectedInterval={selectedInterval}
        results={gameHistoryData.slice(0, 5).map((item: any) => item.number)}
        timePeriod={timerPeriod}
        duration={timerDuration}
        roundLoading={roundLoading}
        roundError={roundError}
      />
      <div className="bg-[#2B3270] ml-[13px] mr-[13px] flex flex-col items-center px-2 md:p-4 lg:p-6 rounded-xl shadow-md space-y-4 md:space-y-6 mt-2 md:mt-4">
        <BetOptions onSelect={(color) => handleOpenBet(color)} />
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
        />
      </div>
      {/* <div className="flex justify-center items-center flex-col bg-[#2B3270] px-2 md:p-4 lg:p-6 rounded-xl shadow-md space-y-4 md:space-y-6 mt-2 md:mt-4 w-full">

      </div> */}

      <BetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedOption={selectedBet}
        roundId={currentRound?.id ? Number(currentRound.id) : null}
        onSuccess={() => {
          // Refresh wallet and my bet history after successful bet
          // 1. Dispatch a custom event for WalletCard to refresh
          window.dispatchEvent(new Event("wallet:refresh"));
          // 2. Refresh my bet history
          if (user?.id) {
            setLoadingMyHistory(true);
            fetch(buildApiUrl(API_ENDPOINTS.WINGO_MY_BETS(Number(user.id))))
              .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch my bet history");
                const data = await res.json();
                const mapped: MyHistoryItem[] = Array.isArray(data.bets)
                  ? data.bets.map((item: any, i: number) => ({
                      ...item,
                      id:
                        item.betId !== undefined
                          ? String(item.betId)
                          : item.period !== undefined
                          ? String(item.period)
                          : String(i),
                      period: item.period ? String(item.period) : String(i),
                      betType: item.betType || "",
                      amount: typeof item.amount === "number" ? item.amount : 0,
                      status: item.status === "-" ? "pending" : "settled",
                      result:
                        item.status === "Win"
                          ? "Win"
                          : item.status === "Lose"
                          ? "Lose"
                          : undefined,
                    }))
                  : ([] as MyHistoryItem[]);
                setMyHistoryData(mapped);
              })
              .catch((err) =>
                setErrorMyHistory(
                  err.message || "Error fetching my bet history"
                )
              )
              .finally(() => setLoadingMyHistory(false));
          }
        }}
      />

      {/* Tab Switcher Buttons */}
      <div className=" rounded-xl mt-6 m-4">
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={() => setActiveTab("game")}
            className={`flex-1 text-sm px-2 py-3 rounded-lg font-semibold transition-all duration-300 transform ${
              activeTab === "game"
                ? "bg-[linear-gradient(180deg,_#2AAAF3_0%,_#2979F2_100%)] text-white shadow-lg scale-105"
                : "bg-[#374992] text-gray-400 hover:bg-gray-600/70 hover:scale-102"
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs sm:text-sm">Game History</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("chart")}
            className={`flex-1 text-sm px-2 py-3 rounded-lg font-semibold transition-all duration-300 transform ${
              activeTab === "chart"
                ? "bg-[linear-gradient(180deg,_#2AAAF3_0%,_#2979F2_100%)] text-white shadow-lg scale-105"
                : "bg-[#374992] text-white hover:bg-gray-600/70 hover:scale-102"
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs sm:text-sm">Chart</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("my")}
            className={`flex-1 text-sm px-2 py-3 rounded-lg font-semibold transition-all duration-300 transform ${
              activeTab === "my"
                ? "bg-[linear-gradient(180deg,_#2AAAF3_0%,_#2979F2_100%)] text-white shadow-lg scale-105"
                : "bg-[#374992] text-white hover:bg-gray-600/70 hover:scale-102"
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs sm:text-sm">My History</span>
            </div>
          </button>
        </div>
      </div>

      {/* Conditionally Rendered Sections */}
      {activeTab === "game" && (
        <>
          {loadingHistory && (
            <div className="bg-[#1e2d5c] text-white rounded-xl p-6 mt-3 md:mt-4 text-center  mb-32">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                <p className="text-gray-300 text-sm">Loading game history...</p>
              </div>
            </div>
          )}
          {errorHistory && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-300 rounded-xl p-4 mt-3 md:mt-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-2xl">⚠️</span>
                <p className="text-sm">{errorHistory}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {!loadingHistory && !errorHistory && (
            <GameHistoryTable history={gameHistoryData}  />
          )}
        </>
      )}

      {
        activeTab === "chart" && <GameChart data={chartData} />
        //  (
        //   <div className="bg-[#1e2d5c] text-white p-4 mt-4 rounded-lg">
        //     <h2 className="text-center text-lg font-bold">📈 Chart View Coming Soon</h2>
        //   </div>
        // )
      }

      {activeTab === "my" && (
        <>
          {loadingMyHistory && (
            <div className="bg-[#1e2d5c] text-white rounded-xl p-6 mt-3 md:mt-4 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                <p className="text-gray-300 text-sm">
                  Loading your bet history...
                </p>
              </div>
            </div>
          )}
          {errorMyHistory && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-300 rounded-xl p-4 mt-3 md:mt-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-2xl">⚠️</span>
                <p className="text-sm">{errorMyHistory}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {!loadingMyHistory && !errorMyHistory && (
            <MyHistoryTable data={myHistoryData as MyHistoryItem[] } />
          )}
        </>
      )}
    </div>
  );
};

export default WingoGame;
