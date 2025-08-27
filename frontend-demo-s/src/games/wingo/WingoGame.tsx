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
import BetResultPopup from "./components/BetResultPopup";

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

  // New state for betting restrictions and countdown
  const [bettingDisabled, setBettingDisabled] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState<number | null>(null);

  // Bet result popup state
  interface BetResult {
    id: string;
    betType: string;
    amount: number;
    result: "Win" | "Lose";
    payout?: number;
    resultNumber?: number;
    period: string;
  }
  const [betResultPopup, setBetResultPopup] = useState<BetResult | null>(null);
  const [previousBetResults, setPreviousBetResults] = useState<Set<string>>(new Set());

  // Backend data integration
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMyHistory, setLoadingMyHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);
  const [errorMyHistory, setErrorMyHistory] = useState<string | null>(null);

  // Function to fetch game history
  const fetchGameHistory = () => {
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
  };

  useEffect(() => {
    fetchGameHistory();
  }, [selectedInterval]); // Add selectedInterval to refresh history when interval changes

  // Function to fetch current round with retry logic
  const fetchCurrentRound = async (intervalLabel: string, retryCount = 0) => {
    const maxRetries = 5;
    setRoundLoading(true);
    setRoundError(null);

    try {
      const res = await fetch(
        buildApiUrl(API_ENDPOINTS.WINGO_CURRENT_ROUND(intervalLabel))
      );

      if (!res.ok) {
        if (res.status === 404 && retryCount < maxRetries) {
          // No current round found, retry after delay
          console.log(
            `🔄 No current round found, retrying in 2 seconds... (${
              retryCount + 1
            }/${maxRetries})`
          );
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
      console.error("❌ Error fetching round:", err.message);
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

  // Timer countdown effect for betting restrictions
  useEffect(() => {
    let countdownInterval: ReturnType<typeof setInterval> | null = null;
    let mainTimerInterval: ReturnType<typeof setInterval> | null = null;

    // Clear any existing intervals first
    if (countdownInterval) clearInterval(countdownInterval);
    if (mainTimerInterval) clearInterval(mainTimerInterval);

    if (timerDuration > 0) {
      // Start main timer that counts down every second
      let currentTime = timerDuration;
      
      mainTimerInterval = setInterval(() => {
        currentTime -= 1;
        
        if (currentTime <= 0) {
          // Round ended, reset everything
          setBettingDisabled(false);
          setCountdownTimer(null);
          setTimerDuration(0);
          if (mainTimerInterval) clearInterval(mainTimerInterval);
          if (countdownInterval) clearInterval(countdownInterval);
          return;
        }
        
        // Update timer duration
        setTimerDuration(currentTime);
        
        // Check if we're in the last 5 seconds
        if (currentTime <= 5 && currentTime > 0) {
          setBettingDisabled(true);
          setCountdownTimer(currentTime);
        } else {
          setBettingDisabled(false);
          setCountdownTimer(null);
        }
      }, 1000);
    } else {
      setBettingDisabled(false);
      setCountdownTimer(null);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (mainTimerInterval) clearInterval(mainTimerInterval);
    };
  }, [timerDuration]);

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
        console.log("🎉 New round received via Socket.IO:", data);
        setCurrentRound(data.round);
        setTimerPeriod(data.round.period || "");
        
        // Calculate fresh timer duration from server data
        const endTime = new Date(data.round.endTime).getTime();
        const now = Date.now();
        const freshDuration = Math.floor((endTime - now) / 1000);
        const safeDuration = Math.max(0, freshDuration);
        
        setTimerDuration(safeDuration);
        setRoundError(null);
        
        // Reset betting restrictions for new round - let the timer effect handle countdown
        setBettingDisabled(false);
        setCountdownTimer(null);
        
        console.log(`🕒 New round timer set to ${safeDuration}s`);
      }
    };

    const handleRoundSettled = (data: any) => {
      console.log("⚡ Round settled via Socket.IO:", data);
      
      const currentInterval = selectedInterval
        .replace("WinGo ", "")
        .replace("sec", "s")
        .replace("min", "m")
        .replace(/\s/g, "")
        .trim();

      // Only refresh game history if this round settled event is for the current interval
      if (data.interval === currentInterval) {
        console.log("🔄 Refreshing game history for current interval:", currentInterval);
        fetchGameHistory();
        
        // Reset betting state and timer for settled round
        setBettingDisabled(false);
        setCountdownTimer(null);
        setTimerDuration(0); // Force timer reset
        
        // Fetch new round immediately after settlement
        setTimeout(() => {
          fetchCurrentRound(currentInterval);
        }, 1000);
      }
    };

    socket.on("round:created", handleRoundCreated);
    socket.on("round:settled", handleRoundSettled);

    return () => {
      socket.off("round:created", handleRoundCreated);
      socket.off("round:settled", handleRoundSettled);
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
                item.status === "Win" ||
                item.result === "Win" ||
                item.win === true
                  ? "Win"
                  : item.status === "Lose" ||
                    item.result === "Lose" ||
                    item.win === false
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
        
        // Check for newly settled bets and show popup (only for current user's bets)
        const newlySettledBets = mapped.filter(bet => 
          bet.status === "settled" && 
          bet.result && 
          !previousBetResults.has(bet.id)
        );
        
        if (newlySettledBets.length > 0 && user?.id && !betResultPopup) {
          // Show popup for the most recent settled bet (only if no popup is currently showing)
          const latestBet = newlySettledBets[0];
          if (latestBet) {
            // Update the set of processed bet results BEFORE showing popup
            const newProcessedResults = new Set(previousBetResults);
            newlySettledBets.forEach(bet => newProcessedResults.add(bet.id));
            setPreviousBetResults(newProcessedResults);
            
            // Show popup only once per bet
            setBetResultPopup({
              id: latestBet.id,
              betType: latestBet.betType,
              amount: latestBet.amount,
              result: latestBet.result as "Win" | "Lose",
              payout: latestBet.result === "Win" ? (latestBet.amount * (latestBet.multiplier || 2)) : undefined,
              resultNumber: latestBet.resultNumber,
              period: latestBet.period
            });
          }
        }
        
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
    if (bettingDisabled) {
      return; // Don't open modal if betting is disabled
    }
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
      
      <div className="bg-[#2B3270] ml-[13px] mr-[13px] flex flex-col items-center px-2 md:p-4 lg:p-6 rounded-xl shadow-md space-y-4 md:space-y-6 mt-2 md:mt-4 relative">
        {/* Countdown Timer Overlay */}
        {bettingDisabled && countdownTimer && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-xl">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2 animate-pulse">
                {countdownTimer.toString().padStart(2, '0')}
              </div>
              <div className="text-lg text-gray-300">
                Betting Disabled
              </div>
            </div>
          </div>
        )}
        
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
                
                // Check for newly settled bets and show popup
                const newlySettledBets = mapped.filter(bet => 
                  bet.status === "settled" && 
                  bet.result && 
                  !previousBetResults.has(bet.id)
                );
                
                if (newlySettledBets.length > 0) {
                  // Show popup for the most recent settled bet
                  const latestBet = newlySettledBets[0];
                  if (latestBet) {
                    setBetResultPopup({
                      id: latestBet.id,
                      betType: latestBet.betType,
                      amount: latestBet.amount,
                      result: latestBet.result as "Win" | "Lose",
                      payout: latestBet.result === "Win" ? (latestBet.amount * (latestBet.multiplier || 2)) : undefined,
                      resultNumber: latestBet.resultNumber,
                      period: latestBet.period
                    });
                  }
                  
                  // Update the set of processed bet results
                  const newProcessedResults = new Set(previousBetResults);
                  newlySettledBets.forEach(bet => newProcessedResults.add(bet.id));
                  setPreviousBetResults(newProcessedResults);
                }
                
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

      {/* Bet Result Popup */}
      <BetResultPopup
        betResult={betResultPopup}
        onClose={() => setBetResultPopup(null)}
      />

      {/* Tab Switcher Buttons */}
      <div className=" rounded-xl mt-6 m-4 ">
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

      <div className="rounded-xl mx-4 sm:p-4 md:p-6 mt-3 md:mt-4 shadow-lg pb-16">
        {/* Conditionally Rendered Sections */}
        {activeTab === "game" && (
          <>
            {loadingHistory && (
              <div className="bg-[#1e2d5c] text-white rounded-xl p-6 mt-3 md:mt-4 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  <p className="text-gray-300 text-sm">
                    Loading game history...
                  </p>
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
              <GameHistoryTable history={gameHistoryData} />
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
              <MyHistoryTable data={myHistoryData as MyHistoryItem[]} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WingoGame;