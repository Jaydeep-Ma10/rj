import React from "react";
import WingoLobby from "./WingoLobby";
import WingoGamePanel from "./WingoGamePanel";
import WingoTabs from "./WingoTabs";


import { useAuth } from "../../hooks/useAuth";

const WingoGame = () => {
  const [interval, setInterval] = React.useState("30s");
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[#181e41] flex flex-col items-center">
      <WingoLobby onIntervalChange={setInterval} selectedInterval={interval} onBalanceRefresh={() => {}} />
      {user?.id ? (
        <>
          <WingoGamePanel interval={interval} userId={typeof user.id === 'string' ? parseInt(user.id) : user.id} />
          <WingoTabs interval={interval} userId={typeof user.id === 'string' ? parseInt(user.id) : user.id} />
        </>
      ) : (
        <div className="text-white mt-8">Please log in to play WinGo.</div>
      )}
    </div>
  );
};

export default WingoGame;
