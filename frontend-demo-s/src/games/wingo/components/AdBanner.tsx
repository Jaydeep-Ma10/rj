import { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { AiFillFire } from "react-icons/ai";
import { messages } from "@/utils/constants"; // Adjust the import path as necessary
import { useNavigate } from "react-router-dom";

const AdBanner = () => {
  const navigate = useNavigate();

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => 
          prevIndex === messages.length - 1 ? 0 : prevIndex + 1
        );
        setIsAnimating(false);
      }, 300); // Animation duration
    }, 4000); // 3 second delay

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex justify-center items-center gap-3 text-white p-3 rounded-lg shadow-sm">
      <Volume2 className="text-[#779de7] w-4 h-4 flex-shrink-0" />
      
      <div className="flex-1 overflow-hidden relative h-10">
        <div 
          className={`transition-transform duration-300 ease-in-out ${
            isAnimating ? 'transform translate-y-[100%] opacity-0' : 'transform translate-y-0 opacity-100'
          }`}
        >
          <p className="text-xs text-left mt-2 leading-tight line-clamp-2 overflow-hidden">
            {messages[currentMessageIndex]}
          </p>
        </div>
      </div>

      <button onClick={() => navigate("/announcement")} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 flex-shrink-0 transition-colors">
        <AiFillFire  className="w-3 h-3" />
        Detail
      </button>
    </div>
  );
};

export default AdBanner;