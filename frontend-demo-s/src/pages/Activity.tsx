import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Activity = () => {
  const navigate = useNavigate();
  return (
    <>
    <div className="relative flex items-center justify-center w-full text-white px-2 py-3 bg-[#2B3270]">
        {/* Left Icon */}
        <ArrowLeft
          onClick={() => navigate(-1)}
          className="absolute left-2 cursor-pointer"
        />

        {/* Center Title */}
        <h2 className="text-lg font-bold ">Recent Activity</h2>
      </div>
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-[#2B3270] rounded shadow p-6">
        {/* This could be a feed of recent games, deposits, withdrawals, etc. */}
        <p className="text-gray-200">Your recent game plays, deposits, withdrawals, and referral activity will appear here. (Coming soon!)</p>
      </div>
    </div>
    </>
  );
};

export default Activity;
