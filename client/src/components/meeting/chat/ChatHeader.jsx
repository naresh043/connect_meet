import { MessageCircle, X } from "lucide-react";

const ChatHeader = ({ onClose, messageCount }) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <MessageCircle size={18} />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">
            Meeting Chat
          </h2>

          <p className="text-xs text-slate-500">
            {messageCount}{" "}
            {messageCount === 1 ? "message" : "messages"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        title="Close chat"
        aria-label="Close chat"
        className="
          flex h-8 w-8
          cursor-pointer
          items-center
          justify-center
          rounded-lg
          text-slate-400
          transition
          hover:bg-slate-800
          hover:text-white
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500/40
        "
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default ChatHeader;