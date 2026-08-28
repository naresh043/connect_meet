import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { joinMeeting } from "../../features/meetings/meetingSlice";

const JoinMeeting = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isJoining } = useSelector((state) => state.meetings);

  const [meetingId, setMeetingId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanMeetingId = meetingId.trim().toUpperCase();

    if (!cleanMeetingId) {
      return;
    }

    const result = await dispatch(joinMeeting(cleanMeetingId));

    if (joinMeeting.fulfilled.match(result)) {
      navigate(`/meeting/${cleanMeetingId}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Join Meeting</h2>

        <p className="text-gray-500 text-sm mt-1">Enter a meeting ID to join</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Meeting ID</label>

          <input
            type="text"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder="e.g. A82F19C3"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          disabled={isJoining || !meetingId.trim()}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {isJoining ? "Joining..." : "Join Meeting"}
        </button>
      </form>
    </div>
  );
};

export default JoinMeeting;
