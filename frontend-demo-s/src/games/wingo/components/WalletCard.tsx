import React from "react";
import Button from "../components/ui/Button";
import { FaWallet } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

const WalletCard: React.FC = () => {
  return (
    <div className="bg-[#1e2d5c] p-5 rounded-xl text-white shadow-md flex flex-col items-center">
      {/* Balance + Refresh in center */}
      <div className="flex flex-col items-center mb-2">
        <p className="text-2xl font-bold">₹0.00</p>
        <MdRefresh size={20} className="text-gray-300 cursor-pointer mt-1" />
      </div>

      {/* Icon + Label */}
      <div className="flex items-center gap-2 mb-4">
        <FaWallet size={18} className="text-white" />
        <span className="text-sm text-gray-300">Wallet Balance</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold">
          Withdraw
        </Button>
        <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold">
          Deposit
        </Button>
      </div>
    </div>
  );
};

export default WalletCard;
