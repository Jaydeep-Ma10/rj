import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import LotteryGames from "@/components/LotteryGames";
import OriginalGames from "@/components/OriginalGames";
import { popularButton, lotteryButton, minigameButton } from "@/assets/images";

const AllGames = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(
    category || "popular"
  );

  useEffect(() => {
    if (category) setSelectedCategory(category);
  }, [category]);

  const renderGames = () => {
    switch (selectedCategory) {
      case "lottery":
        return <LotteryGames />;
      case "minigames":
        return <OriginalGames />;
      case "popular":
      default:
        return <LotteryGames />;
    }
  };

  const categories = [
    {
      name: "popular",
      image: popularButton,
    },
    {
      name: "lottery",
      image: lotteryButton,
    },
    {
      name: "minigames",
      image: minigameButton,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="relative flex items-center justify-center w-full text-white px-2 py-3 bg-[#2B3270]">
        <ArrowLeft
          onClick={() => navigate(-1)}
          className="absolute left-2 cursor-pointer"
        />
        <h2 className="text-lg font-bold capitalize">All</h2>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto px-4 scrollbar-hide">
        <div className="flex gap-1 mb-4 mt-2 flex-nowrap w-max">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center flex-col gap-0 px-6 py-[6px] rounded-lg text-xs font-medium transition-all duration-200
            ${
              isSelected
                ? "bg-[linear-gradient(90deg,_#2AAAF3_0%,_#2979F2_100%)] text-white shadow"
                : "bg-[#2B3270] text-gray-300"
            }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="aspect-[55/32] w-8 object-contain"
                />
                <span className="capitalize">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Games */}
      <div className="px-4">{renderGames()}</div>
    </div>
  );
};

export default AllGames;
