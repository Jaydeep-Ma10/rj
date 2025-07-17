import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/activity", label: "Activity", icon: "📊" },
  { to: "/wallet", label: "Wallet", icon: "💰" },
  { to: "/account", label: "Account", icon: "👤" },
];

const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow flex justify-around z-50 h-77">
    {navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold transition text-gray-700 ${
            isActive ? "text-blue-600" : "hover:text-blue-500"
          }`
        }
      >
        <span className="text-2xl mb-1">{item.icon}</span>
        {item.label}
      </NavLink>
    ))}
  </nav>
);

export default BottomNav;
