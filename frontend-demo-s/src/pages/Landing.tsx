import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Welcome to Win Go</h1>
        <p className="mb-8 text-gray-700">Sign up or log in to play and win!</p>
        <div className="flex flex-col gap-4">
          <button
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold"
            onClick={() => navigate("/signup")}
          >
            Signup
          </button>
          <button
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
