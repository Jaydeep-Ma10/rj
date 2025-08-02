import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/activity", label: "Activity", icon: "📊" },
  { to: "/wallet", label: "Wallet", icon: "💰" },
  { to: "/account", label: "Account", icon: "👤" },
];

const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg flex justify-around z-50 h-16 sm:h-18">
    {navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold transition-all duration-200 transform ${
            isActive 
              ? "text-blue-600 scale-105 bg-blue-50/50" 
              : "text-gray-600 hover:text-blue-500 hover:scale-102 active:scale-95"
          }`
        }
      >
        <span className="text-xl sm:text-2xl mb-0.5 transition-transform duration-200">
          {item.icon}
        </span>
        <span className="text-[10px] sm:text-xs leading-tight">
          {item.label}
        </span>
      </NavLink>
    ))}
  </nav>
);

export default BottomNav;
