import { useSelector } from "react-redux";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        <p>
          <strong>Name:</strong> {user?.name}
        </p>

        <p className="mt-3">
          <strong>Email:</strong> {user?.email}
        </p>
      </div>
    </div>
  );
};

export default Profile;
