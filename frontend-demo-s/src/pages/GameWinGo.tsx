import { useAuth } from "../hooks/useAuth";
import WingoGamePanel from "../games/wingo/WingoGamePanel";
import WingoTabs from "../games/wingo/WingoTabs";

const GameWinGo = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-md w-full bg-white shadow rounded p-6 mx-auto mt-8 text-center">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Win Go Game</h2>
      <p className="mb-6">Welcome, {user?.name || "Guest"}!</p>
      {/* Render the real Wingo game panel, passing the userId */}
      {user?.id ? (
        <>
          <WingoGamePanel interval="30s" userId={typeof user.id === 'string' ? parseInt(user.id) : user.id} />
          <WingoTabs interval="30s" userId={typeof user.id === 'string' ? parseInt(user.id) : user.id} />
        </>
      ) : (
        <div className="bg-gray-100 rounded p-4 text-gray-500">Please log in to play.</div>
      )}
    </div>
  );
};

export default GameWinGo;
