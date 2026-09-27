import { Send } from "lucide-react";
import { useState } from "react";

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [messageText, setMessageText] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) {
      return;
    }

    onSendMessage(trimmedMessage);
    setMessageText("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      handleSubmit(event);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-800 p-3">
      <div className="flex items-end gap-2">
        <textarea
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Connecting..." : "Type a message..."}
          rows={1}
          maxLength={1000}
          disabled={disabled}
          className="
    min-h-10
    max-h-28
    min-w-0
    flex-1
    resize-none
    rounded-xl
    border border-slate-800
    bg-slate-950
    px-3 py-2.5
    text-sm text-white
    outline-none
    placeholder:text-slate-600
    focus:border-indigo-500
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
        />

        <button
          type="submit"
          disabled={disabled || !messageText.trim()}
          title="Send message"
          aria-label="Send message"
          className="
            flex
            h-10
            w-10
            shrink-0
            cursor-pointer
            items-center
            justify-center
            rounded-xl
            bg-indigo-600
            text-white
            transition
            hover:bg-indigo-700
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <Send size={16} />
        </button>
      </div>

      <p className="mt-1.5 px-1 text-[10px] text-slate-600">
        Press Enter to send
      </p>
    </form>
  );
};

export default ChatInput;
