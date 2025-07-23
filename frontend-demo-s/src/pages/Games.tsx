import React from "react";
import { Link, Outlet } from "react-router-dom";
// import "../games/wingo/wingo.css";

const Games: React.FC = () => {
  return (
    <div style={{padding:24}}>

      <div style={{display:'flex',gap:12,marginBottom:24}}>
        <Link to="wingo"><button className="wingo-tab" aria-label="Go to Wingo" /></Link>
        {/* Add more games here as needed */}
      </div>
      <Outlet />
    </div>
  );
};

export default Games;