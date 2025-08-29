import { useEffect, useState } from "react";

interface BetResult {
  id: string;
  betType: string;
  amount: number;
  result: "Win" | "Lose";
  payout?: number;
  resultNumber?: number;
  period: string;
}

interface BetResultPopupProps {
  betResult: BetResult | null;
  onClose: () => void;
}

const BetResultPopup = ({ betResult, onClose }: BetResultPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSlip, setShowSlip] = useState(false);

  useEffect(() => {
    if (betResult) {
      setIsVisible(true);
      // Show slip animation after machine appears
      setTimeout(() => {
        setShowSlip(true);
      }, 500);

      // Auto close after exactly 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [betResult]);

  const handleClose = () => {
    setIsVisible(false);
    setShowSlip(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!betResult) return null;

  const isWin = betResult.result === "Win";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible
          ? "bg-black/70 backdrop-blur-sm"
          : "bg-transparent pointer-events-none"
      }`}
    >
      <div
        className={`relative transform transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        {/* Flowing Ribbon at Top */}
        {isWin && (
          <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-full">
            {/* Main flowing ribbon */}
            <div className="relative">
              <div className="bg-gradient-to-r from-transparent via-red-500 to-transparent h-16 w-96 transform -translate-x-1/2 left-1/2 absolute">
                <div 
                  className="h-full w-full bg-gradient-to-r from-red-400 via-red-500 to-red-600 transform skew-y-1"
                  style={{
                    clipPath: 'polygon(10% 0%, 90% 0%, 95% 50%, 90% 100%, 10% 100%, 5% 50%)',
                    animation: 'ribbonFlow 2s ease-in-out infinite'
                  }}
                >
                  <div className="flex items-center justify-center h-full text-white font-bold text-lg">
                    🎉 CONGRATULATIONS! 🎉
                  </div>
                </div>
              </div>
              
              {/* Ribbon ends flowing effect */}
              <div 
                className="absolute -left-8 top-4 w-16 h-8 bg-red-600 transform rotate-45 opacity-80"
                style={{
                  clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0 100%)',
                  animation: 'ribbonEnd 2s ease-in-out infinite'
                }}
              />
              <div 
                className="absolute -right-8 top-4 w-16 h-8 bg-red-600 transform -rotate-45 opacity-80"
                style={{
                  clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)',
                  animation: 'ribbonEnd 2s ease-in-out infinite reverse'
                }}
              />
            </div>
          </div>
        )}

        {/* Central Rocket */}
        {isWin && (
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-10">
            <div className="relative animate-bounce" style={{ animationDuration: '1.5s' }}>
              {/* Rocket body */}
              <div className="relative">
                {/* Rocket main body */}
                <div className="bg-gradient-to-b from-red-500 to-red-700 w-12 h-20 rounded-t-full relative">
                  {/* Rocket nose */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-yellow-600"></div>
                  
                  {/* Rocket fins */}
                  <div className="absolute bottom-0 -left-2 w-4 h-6 bg-blue-600 transform rotate-45 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 -right-2 w-4 h-6 bg-blue-600 transform -rotate-45 rounded-br-lg"></div>
                  
                  {/* Rocket window */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-200 rounded-full border-2 border-blue-400">
                    <div className="w-2 h-2 bg-blue-600 rounded-full absolute top-1 left-1"></div>
                  </div>
                </div>
                
                {/* Rocket exhaust flames */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-8 bg-gradient-to-t from-red-500 to-yellow-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-10 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-6 bg-gradient-to-t from-red-600 to-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
                
                {/* Smoke trail */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-8 bg-gray-400 opacity-60 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Sparkles around rocket */}
              <div className="absolute -top-4 -left-4 text-yellow-400 text-lg animate-spin">✨</div>
              <div className="absolute -top-2 right-2 text-yellow-300 text-sm animate-ping">⭐</div>
              <div className="absolute top-4 -right-6 text-yellow-500 text-lg animate-pulse">🌟</div>
              <div className="absolute top-8 -left-6 text-yellow-400 text-sm animate-bounce">💫</div>
            </div>
          </div>
        )}

        {/* Additional Confetti Animation for Wins */}
        {isWin && (
          <>
            <div
              className="absolute -top-10 left-10 text-yellow-400 text-2xl animate-bounce"
              style={{ animationDelay: "0.1s" }}
            >
              🎉
            </div>
            <div
              className="absolute -top-8 right-12 text-yellow-300 text-xl animate-bounce"
              style={{ animationDelay: "0.3s" }}
            >
              🎊
            </div>
            <div
              className="absolute -top-12 left-20 text-yellow-500 text-lg animate-bounce"
              style={{ animationDelay: "0.5s" }}
            >
              ✨
            </div>
            <div
              className="absolute -top-6 right-6 text-yellow-400 text-xl animate-bounce"
              style={{ animationDelay: "0.7s" }}
            >
              🌟
            </div>
          </>
        )}

        {/* Lottery Machine */}
        <div className="relative bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 mx-4 max-w-md w-full shadow-2xl">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors z-10"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Round Details Display */}
          <div className="text-center mb-6">
            <div className="bg-black/30 rounded-xl p-3 mb-4">
              <div className="text-yellow-300 text-xs font-bold mb-1">
                ROUND DETAILS
              </div>
              <div className="text-white text-sm mb-1">
                Period:{" "}
                <span className="font-mono font-bold">{betResult.period}</span>
              </div>
              <div className="text-white text-sm">
                Bet: <span className="font-bold">{betResult.betType}</span>
              </div>
            </div>
          </div>

          {/* Payout Slip Coming Out of Machine Mouth */}
          <div className="relative overflow-hidden h-40">
            <div
              className={`absolute -top-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ${
                showSlip ? "translate-y-8" : "translate-y-0"
              }`}
            >
              {/* Compact Payout Slip */}
              <div className="bg-black/30 rounded-lg shadow-lg p-3 w-48">
                {/* Result Status Header */}
                <div
                  className={`text-center py-2 px-3 rounded-lg mb-1 ${
                    isWin
                      ? " text-yellow-300"
                      : "text-yellow-300"
                  }`}
                >
                  <div className="text-lg font-bold">
                    {isWin ? "PAYOUT" : "PAYOUT"}
                  </div>
                </div>

                {/* Payout Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-center text-white">
                    <span className="mr-1 text-sm">Amount Bet:</span>
                    <span className="font-bold">₹{betResult.amount}</span>
                  </div>

                  {betResult.resultNumber !== undefined && (
                    <div className="flex justify-center text-white">
                      <span className="mr-1 text-sm">Winning Number:</span>
                      <span className="font-bold">
                        {betResult.resultNumber}
                      </span>
                    </div>
                  )}

                  {isWin && betResult.payout ? (
                    <div className="flex justify-center text-white">
                      <span className="text-white mr-1 font-bold">
                        TOTAL PAYOUT:
                      </span>
                      <span className="font-bold text-white">
                        ₹{betResult.payout}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-center text-white">
                      <span className="text-white mr-1 font-bold">PAYOUT:</span>
                      <span className="font-bold text-white">₹0</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-2 border border-yellow-400">
              <div
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-75 ease-linear"
                style={{
                  width: isVisible ? "0%" : "100%",
                  animation: isVisible ? "progress 5s linear forwards" : "none",
                }}
              />
            </div>
          </div>
        </div>

        <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes ticketSlide {
          from { transform: translateX(-50%) translateY(100%); }
          to { transform: translateX(-50%) translateY(0); }
        }
        
        @keyframes ribbonFlow {
          0%, 100% { transform: skew(-1deg, 1deg) scale(1); }
          50% { transform: skew(1deg, -1deg) scale(1.02); }
        }
        
        @keyframes ribbonEnd {
          0%, 100% { transform: rotate(45deg) translateY(0px); }
          50% { transform: rotate(45deg) translateY(-2px); }
        }
      `}</style>
      </div>
    </div>
  );
};

export default BetResultPopup;