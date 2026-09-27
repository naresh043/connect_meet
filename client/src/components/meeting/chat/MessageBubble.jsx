const MessageBubble = ({ message, isOwnMessage }) => {
  const formattedTime = new Date(
    message.timestamp,
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          flex max-w-[80%] flex-col
          ${isOwnMessage ? "items-end" : "items-start"}
        `}
      >
        {!isOwnMessage && (
          <span className="mb-1 px-1 text-[11px] font-medium text-slate-500">
            {message.senderName}
          </span>
        )}

        <div
          className={`
            rounded-2xl px-3 py-2
            ${
              isOwnMessage
                ? "rounded-br-md bg-indigo-600 text-white"
                : "rounded-bl-md bg-slate-800 text-slate-200"
            }
          `}
        >
          <p className="break-words text-sm leading-5">
            {message.text}
          </p>
        </div>

        <span className="mt-1 px-1 text-[10px] text-slate-600">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;