import { useState, useEffect, useRef, useCallback } from "react";
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
    interval?: string; // Add interval to track which game the bet was placed on
    roundId?: string; // Track which specific round this bet was placed on
  }
  const [myHistoryData, setMyHistoryData] = useState<MyHistoryItem[]>(
    [] as MyHistoryItem[]
  );

  // Backend-driven round/timer state
  interface Round {
    id: string;
    period: string;
    endTime: string;
    interval?: string; // Add interval to track which game this round belongs to
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

  // Bet result popup state - Updated to track interval-specific bets
  interface BetResult {
    id: string;
    betType: string;
    amount: number;
    result: "Win" | "Lose";
    payout?: number;
    resultNumber?: number;
    period: string;
    interval: string; // Add interval tracking
  }
  const [betResultPopup, setBetResultPopup] = useState<BetResult | null>(null);
  // Track processed results per interval to avoid duplicate popups
  const [processedResultsByInterval, setProcessedResultsByInterval] = useState<Map<string, Set<string>>>(new Map());
  
  // Store pending bets to track which ones we placed
  const [pendingBets, setPendingBets] = useState<Map<string, MyHistoryItem>>(new Map());

  // Backend data integration
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMyHistory, setLoadingMyHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);
  const [errorMyHistory, setErrorMyHistory] = useState<string | null>(null);

  // Rate limiting for API calls
  const lastFetchTime = useRef<number>(0);
  const fetchMyBetsTimeout = useRef<NodeJS.Timeout | null>(null);
  const MIN_FETCH_INTERVAL = 15000; // Minimum 15 seconds between fetches

  // Helper function to get current interval label
  const getCurrentIntervalLabel = () => {
    return selectedInterval
      .replace("WinGo ", "")
      .replace("sec", "s")
      .replace("min", "m")
      .replace(/\s/g, "")
      .trim();
  };

  // Function to fetch game history
  const fetchGameHistory = () => {
    setLoadingHistory(true);
    const interval = getCurrentIntervalLabel();

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
      // Add interval information to the round
      const roundWithInterval = { ...round, interval: intervalLabel };
      setCurrentRound(roundWithInterval);
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
    let intervalLabel = getCurrentIntervalLabel();
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
      const currentInterval = getCurrentIntervalLabel();

      // Only update if this is for the current interval
      if (data.interval === currentInterval) {
        console.log("🎉 New round received via Socket.IO:", data);
        const roundWithInterval = { ...data.round, interval: data.interval };
        setCurrentRound(roundWithInterval);
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
      
      const currentInterval = getCurrentIntervalLabel();

      // Always refresh game history if this round settled event is for the current interval
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

      // IMPORTANT: Check for bet results for the settled round
      if (user?.id) {
        // Extract more data from the socket event
        const settledRoundId = data.round?.id || data.roundId;
        const settledPeriod = data.round?.period || data.period;
        const settledInterval = data.interval;
        
        console.log(`🎯 Round settlement details: interval=${settledInterval}, period=${settledPeriod}, roundId=${settledRoundId}`);
        
        checkForBetResults(settledInterval, settledPeriod, settledRoundId);
      }
    };

    socket.on("round:created", handleRoundCreated);
    socket.on("round:settled", handleRoundSettled);

    return () => {
      socket.off("round:created", handleRoundCreated);
      socket.off("round:settled", handleRoundSettled);
    };
  }, [selectedInterval, user?.id]);

  // Enhanced function to check for bet results for a specific settled round
  const checkForBetResults = async (settledInterval: string, settledPeriod: string, settledRoundId?: string) => {
    try {
      console.log(`🔍 Checking bet results for settled round: ${settledInterval}-${settledPeriod} (roundId: ${settledRoundId})`);
      
      const response = await api.get(`/wingo/my-bets?userId=${user?.id}`);
      const data = response.data;
      
      const mapped: MyHistoryItem[] = Array.isArray(data)
        ? data.map((item: any, i: number) => ({
            id: item.betId !== undefined ? String(item.betId) : String(i),
            period: item.interval && item.serialNumber 
              ? `${item.interval}-${item.serialNumber}`
              : item.period ? String(item.period) : String(i),
            betType: item.betValue || item.betType || item.type || "",
            amount: typeof item.amount === "number" ? item.amount : 0,
            multiplier: typeof item.multiplier === "number" ? item.multiplier : undefined,
            status: item.status === "-" || item.status === "pending" ? "pending" : "settled",
            result: item.status === "Win" || item.result === "Win" || item.win === true
              ? "Win"
              : item.status === "Lose" || item.result === "Lose" || item.win === false
              ? "Lose" 
              : undefined,
            resultNumber: typeof item.resultNumber === "number" ? item.resultNumber : undefined,
            createdAt: item.createdAt || item.timestamp || new Date().toISOString(),
            interval: item.interval || settledInterval,
            roundId: item.roundId ? String(item.roundId) : undefined,
            ...(item.type === "color" && { betType: item.value }),
            ...(item.type === "number" && { betType: `Digit ${item.value}` }),
            ...(item.type === "bigSmall" && { betType: item.value.toUpperCase() }),
          }))
        : [];

      console.log(`📋 Total bets fetched: ${mapped.length}`);
      console.log(`📋 Bets data sample:`, mapped.slice(0, 3));

      // Find bets that match the settled round - multiple strategies
      let relevantBets = mapped.filter(bet => {
        const isSettled = bet.status === "settled" && bet.result;
        
        // Strategy 1: Match by roundId if available
        if (settledRoundId && bet.roundId) {
          const matches = bet.roundId === String(settledRoundId) && isSettled;
          if (matches) console.log(`✅ Round ID match found: bet ${bet.id} for round ${settledRoundId}`);
          return matches;
        }
        
        // Strategy 2: Match by interval and period
        if (settledPeriod && bet.period) {
          const matches = bet.interval === settledInterval && bet.period === settledPeriod && isSettled;
          if (matches) console.log(`✅ Period match found: bet ${bet.id} for ${settledInterval}-${settledPeriod}`);
          return matches;
        }
        
        // Strategy 3: Match by interval only if period data is missing, look for recent bets
        if (!settledPeriod && bet.interval === settledInterval && isSettled) {
          // Check if this bet was created recently (within last 5 minutes)
          const betTime = new Date(bet.createdAt || 0).getTime();
          const now = Date.now();
          const fiveMinutesAgo = now - (5 * 60 * 1000);
          
          const isRecent = betTime > fiveMinutesAgo;
          if (isRecent) console.log(`✅ Recent bet match found: bet ${bet.id} in interval ${settledInterval}`);
          return isRecent;
        }
        
        return false;
      });

      console.log(`📊 Found ${relevantBets.length} relevant settled bets for round ${settledInterval}-${settledPeriod}`);
      
      // If we have pending bets for this interval, also check those
      if (relevantBets.length === 0 && settledInterval) {
        console.log(`🔍 No direct matches found, checking for recently settled bets in interval ${settledInterval}...`);
        
        // Look for any recently settled bets in this interval
        const recentlySettled = mapped.filter(bet => 
          bet.interval === settledInterval && 
          bet.status === "settled" && 
          bet.result &&
          // Check if created within last 2 minutes
          new Date(bet.createdAt || 0).getTime() > (Date.now() - 2 * 60 * 1000)
        );
        
        console.log(`📊 Found ${recentlySettled.length} recently settled bets in interval ${settledInterval}`);
        relevantBets = recentlySettled;
      }

      // Get processed results for this interval
      const processedForInterval = processedResultsByInterval.get(settledInterval) || new Set();
      
      // Find bets that haven't been processed yet
      const newlySettledBets = relevantBets.filter(bet => 
        !processedForInterval.has(bet.id)
      );

      console.log(`🆕 Found ${newlySettledBets.length} newly settled bets to show popup for`);

      if (newlySettledBets.length > 0) {
        // Show popup for the most recent settled bet
        const latestBet = newlySettledBets.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )[0];
        
        if (latestBet) {
          // Update processed results for this interval
          const newProcessedForInterval = new Set(processedForInterval);
          newlySettledBets.forEach(bet => newProcessedForInterval.add(bet.id));
          
          const newProcessedByInterval = new Map(processedResultsByInterval);
          newProcessedByInterval.set(settledInterval, newProcessedForInterval);
          setProcessedResultsByInterval(newProcessedByInterval);
          
          console.log(`🎉 Showing bet result popup for bet ${latestBet.id}: ${latestBet.result}`);
          
          // Close any existing popup first
          setBetResultPopup(null);
          
          // Show new popup after a short delay
          setTimeout(() => {
            setBetResultPopup({
              id: latestBet.id,
              betType: latestBet.betType,
              amount: latestBet.amount,
              result: "Win" as "Win" | "Lose", // Force to "Win" for testing as requested
              payout: latestBet.amount * (latestBet.multiplier || 2), // Always show payout for testing
              resultNumber: latestBet.resultNumber,
              period: latestBet.period,
              interval: settledInterval
            });
          }, 500);
        }
      }

      // Update the main bet history data
      setMyHistoryData(mapped);
      
    } catch (err: any) {
      console.error("❌ Error checking bet results:", err);
    }
  };

  // Rate-limited fetch function for my bets
  const fetchMyBetsWithRateLimit = useCallback(async (force = false) => {
    if (!user?.id) return;

    const now = Date.now();
    if (!force && (now - lastFetchTime.current) < MIN_FETCH_INTERVAL) {
      console.log("⏰ Rate limit: Skipping fetch, too soon since last request");
      return;
    }

    // Clear any pending timeout
    if (fetchMyBetsTimeout.current) {
      clearTimeout(fetchMyBetsTimeout.current);
      fetchMyBetsTimeout.current = null;
    }

    setLoadingMyHistory(true);
    setErrorMyHistory(null);
    
    try {
      console.log("📡 Fetching my bets...");
      lastFetchTime.current = now;
      
      const response = await api.get(`/wingo/my-bets?userId=${user.id}`);
      const data = response.data;
      
      const mapped: MyHistoryItem[] = Array.isArray(data)
        ? data.map((item: any, i: number) => ({
            id: item.betId !== undefined ? String(item.betId) : String(i),
            period: item.interval && item.serialNumber 
              ? `${item.interval}-${item.serialNumber}`
              : item.period ? String(item.period) : String(i),
            betType: item.betValue || item.betType || item.type || "",
            amount: typeof item.amount === "number" ? item.amount : 0,
            multiplier: typeof item.multiplier === "number" ? item.multiplier : undefined,
            status: item.status === "-" || item.status === "pending" ? "pending" : "settled",
            result: item.status === "Win" || item.result === "Win" || item.win === true
              ? "Win"
              : item.status === "Lose" || item.result === "Lose" || item.win === false
              ? "Lose"
              : undefined,
            resultNumber: typeof item.resultNumber === "number" ? item.resultNumber : undefined,
            createdAt: item.createdAt || item.timestamp || new Date().toISOString(),
            interval: item.interval, // Store interval information
            roundId: item.roundId ? String(item.roundId) : undefined,
            ...(item.type === "color" && { betType: item.value }),
            ...(item.type === "number" && { betType: `Digit ${item.value}` }),
            ...(item.type === "bigSmall" && { betType: item.value.toUpperCase() }),
          }))
        : [];
      
      setMyHistoryData(mapped);
      console.log(`✅ Successfully fetched ${mapped.length} bet records`);
      
    } catch (err: any) {
      console.error("❌ Error fetching bet history:", err);
      
      if (err.response?.status === 429) {
        setErrorMyHistory("Too many requests. Please wait before refreshing.");
        // Schedule a retry after a longer delay
        fetchMyBetsTimeout.current = setTimeout(() => {
          fetchMyBetsWithRateLimit(false);
        }, 30000); // 30 seconds delay for 429 errors
      } else {
        setErrorMyHistory(
          err.response?.data?.error ||
          err.message ||
          "Error fetching my bet history"
        );
      }
    } finally {
      setLoadingMyHistory(false);
    }
  }, [user?.id]);

  // Initial fetch and setup interval with rate limiting
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    
    // Initial fetch
    fetchMyBetsWithRateLimit(true);
    
    if (user?.id) {
      // Set up polling with longer interval to avoid rate limits
      intervalId = setInterval(() => {
        fetchMyBetsWithRateLimit(false);
      }, 20000); // Increased to 20 seconds to avoid rate limits
    }

    // Socket.IO real-time update integration (rate limited)
    const socket = getSocket();
    const handleBetUpdate = () => {
      console.log("🔔 Received bet update socket event");
      // Use rate-limited fetch instead of immediate fetch
      fetchMyBetsWithRateLimit(false);
    };
    socket.on("bet:update", handleBetUpdate);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (fetchMyBetsTimeout.current) {
        clearTimeout(fetchMyBetsTimeout.current);
      }
      socket.off("bet:update", handleBetUpdate);
    };
  }, [user?.id, fetchMyBetsWithRateLimit]);

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
          
          // 2. Store the bet information to track it later
          if (currentRound?.id) {
            const newBet: MyHistoryItem = {
              id: `temp-${Date.now()}`, // Temporary ID
              period: currentRound.period,
              betType: selectedBet,
              amount: 0, // Will be updated when we fetch from server
              status: "pending",
              interval: getCurrentIntervalLabel(),
              roundId: currentRound.id,
              createdAt: new Date().toISOString()
            };
            
            const newPendingBets = new Map(pendingBets);
            newPendingBets.set(currentRound.id, newBet);
            setPendingBets(newPendingBets);
            
            console.log(`📝 Stored pending bet for round ${currentRound.id} in interval ${getCurrentIntervalLabel()}`);
          }
          
          // 3. Refresh my bet history immediately after placing bet (but respect rate limits)
          if (user?.id) {
            setTimeout(() => {
              fetchMyBetsWithRateLimit(true); // Force refresh after successful bet
            }, 2000); // Wait 2 seconds to allow server to process
          }
        }}
      />

      {/* Bet Result Popup - now only shows when specific round settles */}
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

        {activeTab === "chart" && <GameChart data={chartData} />}

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