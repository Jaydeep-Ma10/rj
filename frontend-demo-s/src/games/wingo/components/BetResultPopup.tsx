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

  useEffect(() => {
    if (betResult) {
      setIsVisible(true);
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
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!betResult) return null;

  const isWin = betResult.result === "Win";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
      isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
    }`}>
      <div className={`relative bg-gradient-to-br ${
        isWin 
          ? 'from-green-500 to-green-600' 
          : 'from-red-500 to-red-600'
      } rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Result Icon */}
        <div className="text-center mb-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
            isWin ? 'bg-green-400/30' : 'bg-red-400/30'
          } mb-3`}>
            {isWin ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">
            {isWin ? "🎉 You Won!" : "😔 You Lost"}
          </h2>
          
          <p className="text-white/90 text-sm">
            Period prasad : {betResult.period}
          </p>
        </div>

        {/* Bet Details */}
        <div className="bg-white/20 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-sm">Bet Type:</span>
            <span className="text-white font-semibold">{betResult.betType}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-sm">Amount:</span>
            <span className="text-white font-semibold">₹{betResult.amount}</span>
          </div>
          
          {betResult.resultNumber !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm">Result:</span>
              <span className="text-white font-semibold">{betResult.resultNumber}</span>
            </div>
          )}
          
          {isWin && betResult.payout && (
            <div className="flex justify-between items-center border-t border-white/20 pt-3">
              <span className="text-white/80 text-sm">Payout:</span>
              <span className="text-white font-bold text-lg">₹{betResult.payout}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-4000 ease-linear"
              style={{
                width: isVisible ? '0%' : '100%',
                animation: isVisible ? 'progress 5s linear forwards' : 'none'
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
      `}</style>
    </div>
  );
};

export default BetResultPopup;
