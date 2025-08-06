import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { messages } from "@/utils/constants";
import { HiSpeakerphone } from "react-icons/hi";

const Announcement = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="relative flex items-center justify-center w-full text-white px-2 py-3 bg-[#2B3270]">
        {/* Left Icon */}
        <ArrowLeft
          onClick={() => navigate(-1)}
          className="absolute left-2 cursor-pointer"
        />

        {/* Center Title */}
        <h2 className="text-lg font-bold ">Announcement</h2>
      </div>

      <div className="mt-2 mx-3 rounded-lg text-sm px-2 bg-[#2B3270]">
        <div className=" px-4 py-2">
          <div className="flex text-base text-white">
          <HiSpeakerphone className="inline-block mr-2 text-2xl text-[#61a9ff]" />
          Welcome
          </div>
          <p className="text-xs text-gray-400 mt-1">
          {messages[0]}
          </p>
        </div>
      </div>

      <div className="mt-2 mx-3 rounded-lg text-sm px-2 bg-[#2B3270]">
        <div className=" px-4 py-2 ">
          <div className="flex text-base text-white">
          <HiSpeakerphone className="inline-block mr-2 text-2xl text-[#61a9ff]" />
          Avoid Scammers And Phishing Links 
          </div>
          <p className="text-xs text-gray-400 mt-1">
          {messages[1]}
          </p>
        </div>
      </div>

      <div className="mt-2 mx-3 rounded-lg text-sm px-2 bg-[#2B3270]">
        <div className=" px-4 py-2">
          <div className="flex text-base text-white">
          <HiSpeakerphone className="inline-block mr-2 text-2xl text-[#61a9ff]" />
          Beware of Fraud and Scammers
          </div>
          <p className="text-xs text-gray-400 mt-1">
          {messages[2]}
          </p>
        </div>
      </div>
    </div>

    
  );
};

export default Announcement;
