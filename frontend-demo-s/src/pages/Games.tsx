import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const Games: React.FC = () => {
  const location = useLocation();
  const isGameSelected = location.pathname !== '/games';

  return (
    <div className="min-h-screen bg-[#121d45] w-full">
      {/* Game Selection Header - Only show when no game is selected */}
      {!isGameSelected && (
        <div className="p-4 sm:p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              🎮 Choose Your Game
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Select a game to start playing and winning!
            </p>
          </div>
          
          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {/* Wingo Game Card */}
            <Link to="wingo" className="group">
              <div className="bg-gradient-to-br from-[#1e2d5c] to-[#2a3f7a] rounded-xl p-6 border border-gray-600 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl mb-4 group-hover:animate-bounce">
                    🎯
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    WinGo
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base mb-4">
                    Predict colors and numbers to win big!
                  </p>
                  <div className="flex justify-center space-x-2 mb-4">
                    <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
                      Red
                    </span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                      Green
                    </span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                      Violet
                    </span>
                  </div>
                  <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold text-sm group-hover:bg-yellow-300 transition-colors">
                    Play Now
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Placeholder for future games */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-gray-600 opacity-50">
              <div className="text-center">
                <div className="text-4xl md:text-5xl mb-4">
                  🎲
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Coming Soon
                </h3>
                <p className="text-gray-400 text-sm md:text-base mb-4">
                  More exciting games on the way!
                </p>
                <div className="bg-gray-600 text-gray-400 px-4 py-2 rounded-lg font-semibold text-sm cursor-not-allowed">
                  Stay Tuned
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-gray-600 opacity-50">
              <div className="text-center">
                <div className="text-4xl md:text-5xl mb-4">
                  🃏
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Coming Soon
                </h3>
                <p className="text-gray-400 text-sm md:text-base mb-4">
                  More exciting games on the way!
                </p>
                <div className="bg-gray-600 text-gray-400 px-4 py-2 rounded-lg font-semibold text-sm cursor-not-allowed">
                  Stay Tuned
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Game Content */}
      <Outlet />
    </div>
  );
};

export default Games;
