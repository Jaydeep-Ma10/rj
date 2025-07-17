// src/pages/Home.tsx
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow p-6">
        {/* Advertisement Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-yellow-100 rounded-lg p-4 shadow text-center animate-pulse">
            <h2 className="text-lg font-bold text-yellow-800 mb-1">🔥 Hot Offer!</h2>
            <p className="text-yellow-900 text-sm">Deposit now and get 10% bonus coins!</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 shadow text-center animate-pulse">
            <h2 className="text-lg font-bold text-blue-800 mb-1">🎁 Invite Friends</h2>
            <p className="text-blue-900 text-sm">Earn rewards for every referral who plays!</p>
          </div>
        </div>
        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Win Go Card */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center min-h-[180px]">
            <img src="https://cdn-icons-png.flaticon.com/512/1040/1040231.png" alt="Win Go" className="w-12 h-12 mb-1" />
            <h2 className="text-base font-bold mb-1 text-purple-700">Win Go</h2>
            <p className="mb-1 text-gray-600 text-xs text-center">Play and win big!</p>
            <Link to="/games/wingo" className="mt-auto">
              <button className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-purple-700 transition">Play Now</button>
            </Link>
          </div>
          {/* Game 2 - Coming Soon */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center min-h-[180px] opacity-70">
            <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="Game 2" className="w-12 h-12 mb-1 grayscale" />
            <h2 className="text-base font-bold mb-1 text-gray-500">Game 2</h2>
            <p className="mb-1 text-gray-400 text-xs text-center">Coming Soon</p>
            <button className="bg-gray-300 text-gray-600 px-3 py-1 rounded text-xs font-semibold cursor-not-allowed mt-auto" disabled>Coming Soon</button>
          </div>
          {/* Game 3 - Coming Soon */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center min-h-[180px] opacity-70">
            <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="Game 3" className="w-12 h-12 mb-1 grayscale" />
            <h2 className="text-base font-bold mb-1 text-gray-500">Game 3</h2>
            <p className="mb-1 text-gray-400 text-xs text-center">Coming Soon</p>
            <button className="bg-gray-300 text-gray-600 px-3 py-1 rounded text-xs font-semibold cursor-not-allowed mt-auto" disabled>Coming Soon</button>
          </div>
          {/* Game 4 - Coming Soon */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center min-h-[180px] opacity-70">
            <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="Game 4" className="w-12 h-12 mb-1 grayscale" />
            <h2 className="text-base font-bold mb-1 text-gray-500">Game 4</h2>
            <p className="mb-1 text-gray-400 text-xs text-center">Coming Soon</p>
            <button className="bg-gray-300 text-gray-600 px-3 py-1 rounded text-xs font-semibold cursor-not-allowed mt-auto" disabled>Coming Soon</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
