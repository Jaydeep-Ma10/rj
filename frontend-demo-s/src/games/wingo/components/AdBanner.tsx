import React from "react";
import { FaVolumeUp } from "react-icons/fa";

const AdBanner: React.FC = () => {
  return (
    <div className="flex items-center gap-3 bg-[#1e2d5c] text-white p-3 mt-3 rounded-lg shadow-sm">
      <FaVolumeUp />
      <p className="text-sm flex-1">
        Please be sure to always use our official website for playing the games
        with the fol
      </p>
      <button className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
        Detail
      </button>
    </div>
  );
};

export default AdBanner;
