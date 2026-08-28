import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../features/auth/authSlice";

import {
  getMyMeetings,
  clearMeetingError,
} from "../features/meetings/meetingSlice";

import CreateMeeting from "../components/dashboard/CreateMeeting";
import JoinMeeting from "../components/dashboard/JoinMeeting";
import MeetingCard from "../components/dashboard/MeetingCard";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const { meetings, isLoading, error } = useSelector((state) => state.meetings);

  /*
  =====================================================
  LOAD MEETINGS
  =====================================================
  */

  useEffect(() => {
    dispatch(getMyMeetings());
  }, [dispatch]);

  /*
  =====================================================
  LOGOUT
  =====================================================
  */

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  /*
  =====================================================
  UI
  =====================================================
  */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ConnectMeet</h1>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.name}</span>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* HEADER */}

        <div className="mb-8">
          <h2 className="text-3xl font-bold">Welcome, {user?.name} 👋</h2>

          <p className="text-gray-500 mt-2">Start or join a video meeting.</p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex justify-between">
            <span>{error}</span>

            <button
              onClick={() => dispatch(clearMeetingError())}
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* CREATE / JOIN */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CreateMeeting />

          <JoinMeeting />
        </div>

        {/* MEETING HISTORY */}

        <section className="mt-10">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-2xl font-bold">Your Meetings</h2>

              <p className="text-gray-500 text-sm mt-1">
                Meetings created by you
              </p>
            </div>

            <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
              {meetings.length} Meetings
            </span>
          </div>

          {/* LOADING */}

          {isLoading && (
            <div className="bg-white border rounded-xl p-8 text-center">
              Loading meetings...
            </div>
          )}

          {/* EMPTY */}

          {!isLoading && meetings.length === 0 && (
            <div className="bg-white border rounded-xl p-10 text-center">
              <h3 className="text-lg font-semibold">No meetings yet</h3>

              <p className="text-gray-500 mt-2">
                Create your first meeting above.
              </p>
            </div>
          )}

          {/* MEETINGS */}

          {!isLoading && meetings.length > 0 && (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <MeetingCard key={meeting._id} meeting={meeting} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
