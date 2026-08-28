import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>

      <p className="text-gray-600 mt-3">Page not found</p>

      <Link to="/" className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-md">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
