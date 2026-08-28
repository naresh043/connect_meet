import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { createMeeting } from "../../features/meetings/meetingSlice";

const CreateMeeting = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isCreating } = useSelector((state) => state.meetings);

  const [title, setTitle] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    const result = await dispatch(createMeeting(title.trim()));

    if (createMeeting.fulfilled.match(result)) {
      const meeting = result.payload.meeting;

      navigate(`/meeting/${meeting.meetingId}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Create Meeting</h2>

        <p className="text-gray-500 text-sm mt-1">Start a new video meeting</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Meeting Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. MERN Team Meeting"
            maxLength={100}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isCreating || !title.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Create Meeting"}
        </button>
      </form>
    </div>
  );
};

export default CreateMeeting;
