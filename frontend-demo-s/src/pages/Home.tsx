import { useNavigate } from "react-router-dom";
import { IoNotificationsSharp } from "react-icons/io5";
import AdBanner from "@/games/wingo/components/AdBanner";
import LotteryGames from "@/components/LotteryGames";
import OriginalGames from "@/components/OriginalGames";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-end px-2 py-3 bg-[#2B3270]">
        <IoNotificationsSharp className="cursor-pointer text-2xl text-[#408ae6]" />
      </div>
      <AdBanner />
      <div className="p-6 mb-40">
        {/* Lottery Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex font-bold text-white">
              <div className=" bg-[#61A9FF] mr-2 p-1 rounded-md" />
              <h2>Lottery</h2>
            </div>
            <div className="text-xs border-[0.2px] border-gray-300 text-gray-300 rounded-md py-[0.5px] px-4">
              <button onClick={() => navigate("/games/all/lottery")}>All &gt;</button>
            </div>
          </div>
          <LotteryGames />
        </div>

        {/* Original Section */}
        <div>
          <div className="flex justify-between items-center mb-4 mt-6">
            <div className="flex font-bold text-white">
              <div className=" bg-[#61A9FF] mr-2 p-1 rounded-md" />
              <h2>Original</h2>
            </div>
            <div className="text-xs border-[0.2px] border-gray-300 text-gray-300 rounded-md py-[0.5px] px-4">
              <button onClick={() => navigate("/games/all/minigames")}>All &gt;</button>
            </div>
          </div>
          <OriginalGames />
        </div>
      </div>
    </div>
  );
};

export default Home;
