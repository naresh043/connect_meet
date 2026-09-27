import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";

const MessageList = ({ messages, currentUser }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const currentUserId =
    currentUser?.id ||
    currentUser?._id ||
    null;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
              <span className="text-lg">💬</span>
            </div>

            <h3 className="text-sm font-medium text-slate-300">
              No messages yet
            </h3>

            <p className="mt-1 text-xs text-slate-600">
              Start the conversation.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => {
            const isOwnMessage =
              message.senderId === currentUserId;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
              />
            );
          })}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;