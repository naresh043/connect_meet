import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">ConnectMeet</h1>

        <p className="text-gray-600 mb-8">
          Real-time video meetings built with MERN
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-md"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
