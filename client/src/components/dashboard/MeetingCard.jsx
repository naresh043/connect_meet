import { useNavigate } from "react-router-dom";

const MeetingCard = ({ meeting }) => {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate(`/meeting/${meeting.meetingId}`);
  };

  return (
    <div className="bg-white border rounded-xl p-5 flex items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-lg">{meeting.title}</h3>

        <p className="text-sm text-gray-500 mt-1">
          Meeting ID:
          <span className="font-mono ml-2">{meeting.meetingId}</span>
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Status:
          <span className="ml-2 capitalize">{meeting.status}</span>
        </p>
      </div>

      <button
        onClick={handleJoin}
        disabled={meeting.status === "ended"}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40"
      >
        Join
      </button>
    </div>
  );
};

export default MeetingCard;
