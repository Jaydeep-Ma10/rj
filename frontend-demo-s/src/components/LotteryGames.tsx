import { Link } from "react-router-dom";
import { wingoGame } from "@/assets/images";

const LotteryGames = () => {
  return (
    <>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-3 flex flex-col items-center min-h-[180px] bg-cover bg-center relative bg-[#374992]">
          <h2 className="text-lg font-bold mb-1 text-white">Win Go</h2>
          <img
            src={wingoGame}
            alt="Win Go"
            className="h-32 object-contain mb-1 absolute top-1/2 transform -translate-y-1/2"
          />
          <Link to="games/wingo" className="mt-auto w-full">
            <button className="w-full border-[0.3px] border-white text-white px-3 py-1 rounded-lg text-xs font-semibold hover:opacity-90 transition-all">
              Play Now &gt;
            </button>
          </Link>
        </div>

        {/* Game 2 - Coming Soon */}
        <div className="bg-white/5 rounded-xl shadow p-4 flex flex-col items-center min-h-[180px] border border-white/10 backdrop-blur-sm">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png"
            alt="Game"
            className="w-12 h-12 mb-2 grayscale opacity-70"
          />
          <h2 className="text-base font-semibold mb-1 text-gray-300">Game 2</h2>
          <p className="mb-2 text-gray-400 text-xs text-center">Coming Soon</p>
          <button
            className="bg-gray-500/40 text-gray-300 px-3 py-1 rounded text-xs font-semibold cursor-not-allowed mt-auto"
            disabled
          >
            Coming Soon
          </button>
        </div>

        {/* Game 3 - Coming Soon */}
        <div className="bg-white/5 rounded-xl shadow p-4 flex flex-col items-center min-h-[180px] border border-white/10 backdrop-blur-sm">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png"
            alt="Game"
            className="w-12 h-12 mb-2 grayscale opacity-70"
          />
          <h2 className="text-base font-semibold mb-1 text-gray-300">Game 3</h2>
          <p className="mb-2 text-gray-400 text-xs text-center">Coming Soon</p>
          <button
            className="bg-gray-500/40 text-gray-300 px-3 py-1 rounded text-xs font-semibold cursor-not-allowed mt-auto"
            disabled
          >
            Coming Soon
          </button>
        </div>

        {/* Game 4 - Coming Soon */}
        <div className="bg-white/5 rounded-xl shadow p-4 flex flex-col items-center min-h-[180px] border border-white/10 backdrop-blur-sm">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png"
            alt="Game"
            className="w-12 h-12 mb-2 grayscale opacity-70"
          />
          <h2 className="text-base font-semibold mb-1 text-gray-300">Game 4</h2>
          <p className="mb-2 text-gray-400 text-xs text-center">Coming Soon</p>
          <button
            className="bg-gray-500/40 text-gray-300 px-3 py-1 rounded text-xs font-semibold cursor-not-allowed mt-auto"
            disabled
          >
            Coming Soon
          </button>
        </div>
      </div>
    </>
  );
};

export default LotteryGames;
