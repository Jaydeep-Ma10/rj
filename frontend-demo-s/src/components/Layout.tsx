import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-blue-700">
            Win Go
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-gray-700 font-medium">{user.name}</span>
              <button
                className="ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>
              <button
                className="ml-1 px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="ml-2 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                onClick={() => navigate("/signup")}
              >
                Signup
              </button>
            </>
          )}
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
