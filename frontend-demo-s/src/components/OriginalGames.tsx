import { Link } from "react-router-dom";
import { Aviator } from "@/assets/images";

const OriginalGames = () => {

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {/* Game 1 - Aviator */}
        <Link to="games/wingo" className="mt-auto w-full">
          <div className="rounded-xl flex flex-col bg-cover bg-center aspect-[139/188] overflow-hidden">
            <img
              src={Aviator}
              alt="Win Go"
              className="h-full w-full object-contain"
            />
          </div>
        </Link>

        {/* Game 2 - Coming Soon */}
        <div className="bg-white/5 rounded-xl shadow flex flex-col items-center aspect-[139/188] border border-white/10 backdrop-blur-sm pt-4">
        <img
            src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png"
            alt="Game"
            className="w-12 h-12 mb-2 grayscale opacity-70"
          />
          <h2 className="text-sm font-semibold mb-1 text-gray-300">Game 2</h2>
          <p className=" text-gray-400 text-xs text-center">Coming Soon</p>
          {/* <button
            className="bg-gray-500/40 text-gray-300 px-3 py-1 rounded text-xs font-semibold cursor-not-allowed mt-auto"
            disabled
          >
            Coming Soon
          </button> */}
        </div>

        {/* Game 3 - Coming Soon */}
        <div className="bg-white/5 rounded-xl shadow flex flex-col items-center aspect-[139/188] border border-white/10 backdrop-blur-sm pt-4">
        <img
            src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png"
            alt="Game"
            className="w-12 h-12 mb-2 grayscale opacity-70"
          />
          <h2 className="text-sm font-semibold mb-1 text-gray-300">Game 3</h2>
          <p className=" text-gray-400 text-xs text-center">Coming Soon</p>
          {/* <button
            className="bg-gray-500/40 text-gray-300 px-3 py-1 rounded text-xs font-semibold cursor-not-allowed mt-auto"
            disabled
          >
            Coming Soon
          </button> */}
        </div>
      </div>
    </>
  );
};

export default OriginalGames;
