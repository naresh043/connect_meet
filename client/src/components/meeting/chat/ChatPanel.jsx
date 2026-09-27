import { useEffect, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

import SOCKET_EVENTS from "../../../socket/socketEvents";
import httpClient from "../../../services/httpClient";

const ChatPanel = ({ meetingId, currentUser, socket, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [chatError, setChatError] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  /**
   * =====================================================
   * LOAD CHAT HISTORY
   * =====================================================
   */

  useEffect(() => {
    if (!meetingId) return;

    let isMounted = true;

    const loadChatHistory = async () => {
      try {
        setIsLoadingMessages(true);
        setChatError("");

        const response = await httpClient.get(
          `/meetings/${encodeURIComponent(meetingId)}/messages`,
          {
            params: {
              limit: 50,
            },
          },
        );

        if (!isMounted) return;

        const loadedMessages = response?.data?.data?.messages || [];

        setMessages(loadedMessages);
      } catch (error) {
        console.error("❌ Failed to load chat history:", error);

        if (!isMounted) return;

        setChatError(
          error?.response?.data?.message || "Unable to load chat history.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      }
    };

    loadChatHistory();

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  /**
   * =====================================================
   * RECEIVE REAL-TIME MESSAGE
   * =====================================================
   */

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      if (!message) return;

      if (message.meetingId !== meetingId) return;

      setMessages((previousMessages) => {
        const alreadyExists = previousMessages.some(
          (existingMessage) => existingMessage.id === message.id,
        );

        if (alreadyExists) {
          return previousMessages;
        }

        return [...previousMessages, message];
      });

      setChatError("");
    };

    /**
     * ===================================================
     * CHAT ERROR
     * ===================================================
     */

    const handleChatError = (error) => {
      console.error("❌ Chat error:", error);

      setChatError(error?.message || "Unable to send message.");
    };

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    socket.on(SOCKET_EVENTS.CHAT_ERROR, handleChatError);

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

      socket.off(SOCKET_EVENTS.CHAT_ERROR, handleChatError);
    };
  }, [socket, meetingId]);

  /**
   * =====================================================
   * SEND MESSAGE
   * =====================================================
   */

  const handleSendMessage = (text) => {
    if (!socket) {
      setChatError("Chat connection is not available.");
      return;
    }

    if (!socket.connected) {
      setChatError("You are not connected to the meeting.");
      return;
    }

    if (!meetingId) {
      setChatError("Meeting ID is missing.");
      return;
    }

    const trimmedText = text.trim();

    if (!trimmedText) return;

    socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      meetingId,
      text: trimmedText,
    });

    setChatError("");
  };

  return (
    <aside
      className="
        fixed z-[150] flex flex-col overflow-hidden
        border border-slate-800 bg-slate-900
        shadow-2xl shadow-black/50

        inset-x-2 bottom-20 top-20
        w-auto rounded-2xl

        sm:left-auto
        sm:right-4
        sm:top-20
        sm:bottom-20
        sm:w-[360px]
        sm:max-w-[calc(100vw-2rem)]

        md:right-5
        md:w-[380px]
        md:max-w-[380px]
      "
      aria-label="Meeting chat"
    >
      {/* Header */}

      <ChatHeader onClose={onClose} messageCount={messages.length} />

      {/* Error */}

      {chatError && (
        <div
          className="
            shrink-0
            border-b border-red-500/10
            bg-red-500/5
            px-4 py-2
            text-xs text-red-400
          "
        >
          {chatError}
        </div>
      )}

      {/* Loading */}

      {isLoadingMessages && (
        <div
          className="
            shrink-0
            border-b border-slate-800
            px-4 py-2
            text-center
            text-xs text-slate-500
          "
        >
          Loading chat history...
        </div>
      )}

      {/* Messages */}

      <MessageList messages={messages} currentUser={currentUser} />

      {/* Input */}

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={!socket?.connected}
      />
    </aside>
  );
};

export default ChatPanel;
