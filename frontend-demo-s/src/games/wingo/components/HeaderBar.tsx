// src/games/wingo/components/HeaderBar.tsx
import { ArrowLeft, Headphones, Wallet } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
// import logo from '../assets/logo.png';

export default function HeaderBar() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#1E2A78] text-white">
      <ArrowLeft onClick={() => navigate(-1)} className="cursor-pointer" />
      {/* <img src={logo} alt="logo" className="h-6" /> */}
      <Headphones className="cursor-pointer" />
    </div>
  );
}
