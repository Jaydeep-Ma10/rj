import { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { AiFillFire } from "react-icons/ai";

const AdBanner = () => {
  const messages = [
    "Welcome to the Tiranga Games! Greetings, Gamers and Enthusiasts! The Tiranga Games is more than just a platform for gaming. We invite you to join us, you'll find a variety of games, promo, bonus, luxury gold awards, Register now and win.",
    "Please be sure to always use our official website for playing the games with the following link, https://tirangacasino.win. Please always check our official link to access our website and avoid scammers and phishing links",
    "If your deposit not receive, please send it directly to Tiranga Games Self-service Center (https://www.tirangaservice.com) wait till already get process, do not send to another person and trust anyone claiming to represent Tiranga Games. Always verify our website authenticity through the official community channels. Your safety and trust is our priority."
  ];

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
      
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 flex-shrink-0 transition-colors">
        <AiFillFire  className="w-3 h-3" />
        Detail
      </button>
    </div>
  );
};

export default AdBanner;