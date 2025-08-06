import { NavLink } from "react-router-dom";
import { footer } from "@/assets/images";
import { MdAccountCircle, MdHomeFilled } from "react-icons/md";
import { PiShoppingBagFill } from "react-icons/pi";
import { IoWalletSharp } from "react-icons/io5";

const navItems = [
  { to: "/", label: "Home", icon: <MdHomeFilled /> },
  { to: "/activity", label: "Activity", icon: <PiShoppingBagFill /> },
  { to: "/wallet", label: "Wallet", icon: <IoWalletSharp /> },
  { to: "/account", label: "Account", icon: <MdAccountCircle /> },
];

const BottomNav = () => {
  // Split navItems into two groups
  const firstGroup = navItems.slice(0, 2);
  const secondGroup = navItems.slice(2);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 sm:h-18">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={footer}
          alt="Navigation background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navigation Items with gap */}
      <div className="relative z-10 flex justify-around h-full shadow-lg">
        <div className="flex flex-1 justify-evenly">
          {firstGroup.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center h-full text-xs font-semibold transition-all duration-200 transform ${
                  isActive
                    ? "text-[#61A9FF] scale-105"
                    : "text-[#ACAFA2] hover:text-blue-500 hover:scale-102 active:scale-95"
                }`
              }
            >
              <span className="text-xl sm:text-2xl mb-0.5 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="text-[11px] sm:text-xs leading-tight">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Add horizontal gap here */}
        <div className="w-10 sm:w-10" />

        <div className="flex flex-1 justify-evenly">
          {secondGroup.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center h-full text-xs font-semibold transition-all duration-200 transform ${
                  isActive
                    ? "text-[#61A9FF] scale-105"
                    : "text-[#ACAFA2] hover:text-blue-500 hover:scale-102 active:scale-95"
                }`
              }
            >
              <span className="text-xl sm:text-2xl mb-0.5 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="text-[11px] sm:text-xs leading-tight">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
