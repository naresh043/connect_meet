import { useCallback, useEffect, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

import SOCKET_EVENTS from "../../../socket/socketEvents";
import httpClient from "../../../services/httpClient";

const CHAT_PAGE_SIZE = 50;

const ChatPanel = ({ meetingId, currentUser, socket, onClose }) => {
  const [messages, setMessages] = useState([]);

  const [chatError, setChatError] = useState("");

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  const [nextCursor, setNextCursor] = useState(null);

  /**
   * =====================================================
   * MERGE MESSAGES
   * =====================================================
   *
   * Keeps messages unique by message ID and sorts them
   * chronologically.
   */
  const mergeMessages = useCallback((existingMessages, incomingMessages) => {
    const messageMap = new Map();

    [...existingMessages, ...incomingMessages].forEach((message) => {
      if (!message?.id) return;

      messageMap.set(message.id, message);
    });

    return Array.from(messageMap.values()).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }, []);

  /**
   * =====================================================
   * LOAD INITIAL CHAT HISTORY
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
              limit: CHAT_PAGE_SIZE,
            },
          },
        );

        if (!isMounted) return;

        const loadedMessages = response?.data?.data?.messages || [];

        const pagination = response?.data?.data?.pagination || {};

        setMessages((previousMessages) =>
          mergeMessages(previousMessages, loadedMessages),
        );

        setHasMoreMessages(Boolean(pagination.hasMore));

        setNextCursor(pagination.nextCursor || null);
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
  }, [meetingId, mergeMessages]);

  /**
   * =====================================================
   * LOAD OLDER CHAT MESSAGES
   * =====================================================
   */
  const loadOlderMessages = useCallback(async () => {
    if (!meetingId) return;

    if (!hasMoreMessages) return;

    if (!nextCursor) return;

    if (isLoadingOlder) return;

    try {
      setIsLoadingOlder(true);
      setChatError("");

      const response = await httpClient.get(
        `/meetings/${encodeURIComponent(meetingId)}/messages`,
        {
          params: {
            limit: CHAT_PAGE_SIZE,
            before: nextCursor,
          },
        },
      );

      const olderMessages = response?.data?.data?.messages || [];

      const pagination = response?.data?.data?.pagination || {};

      setMessages((previousMessages) =>
        mergeMessages(previousMessages, olderMessages),
      );

      setHasMoreMessages(Boolean(pagination.hasMore));

      setNextCursor(pagination.nextCursor || null);
    } catch (error) {
      console.error("❌ Failed to load older messages:", error);

      setChatError(
        error?.response?.data?.message || "Unable to load older messages.",
      );
    } finally {
      setIsLoadingOlder(false);
    }
  }, [meetingId, hasMoreMessages, nextCursor, isLoadingOlder, mergeMessages]);

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

        return mergeMessages(previousMessages, [message]);
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
  }, [socket, meetingId, mergeMessages]);

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

      {/* Initial loading */}

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

      <MessageList
        messages={messages}
        currentUser={currentUser}
        hasMoreMessages={hasMoreMessages}
        isLoadingOlder={isLoadingOlder}
        onLoadOlder={loadOlderMessages}
      />

      {/* Input */}

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={!socket?.connected}
      />
    </aside>
  );
};

export default ChatPanel;
