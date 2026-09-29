import { useCallback, useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";

const SCROLL_THRESHOLD = 80;

const MessageList = ({
  messages,
  currentUser,
  hasMoreMessages = false,
  isLoadingOlder = false,
  onLoadOlder,
}) => {
  const scrollContainerRef = useRef(null);

  const bottomRef = useRef(null);

  const previousMessageCountRef = useRef(messages.length);

  const shouldPreserveScrollRef = useRef(false);

  const previousScrollHeightRef = useRef(0);

  /**
   * =====================================================
   * CURRENT USER
   * =====================================================
   */
  const currentUserId =
    currentUser?.id?.toString() || currentUser?._id?.toString() || null;

  /**
   * =====================================================
   * HANDLE SCROLL
   * =====================================================
   */
  const handleScroll = useCallback(
    (event) => {
      const container = event.currentTarget;

      if (
        container.scrollTop <= SCROLL_THRESHOLD &&
        hasMoreMessages &&
        !isLoadingOlder &&
        typeof onLoadOlder === "function"
      ) {
        /*
         * Save current scroll height before loading
         * older messages.
         *
         * After older messages are added, we use the
         * difference to preserve the user's position.
         */
        previousScrollHeightRef.current = container.scrollHeight;

        shouldPreserveScrollRef.current = true;

        onLoadOlder();
      }
    },
    [hasMoreMessages, isLoadingOlder, onLoadOlder],
  );

  /**
   * =====================================================
   * PRESERVE SCROLL POSITION
   * =====================================================
   *
   * When older messages are prepended, the scroll height
   * increases. We compensate for that increase so the
   * user stays around the same message.
   */
  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    if (!shouldPreserveScrollRef.current) {
      return;
    }

    if (isLoadingOlder) {
      return;
    }

    const previousScrollHeight = previousScrollHeightRef.current;

    if (!previousScrollHeight) {
      shouldPreserveScrollRef.current = false;
      return;
    }

    const newScrollHeight = container.scrollHeight;

    const heightDifference = newScrollHeight - previousScrollHeight;

    if (heightDifference > 0) {
      container.scrollTop += heightDifference;
    }

    previousScrollHeightRef.current = 0;

    shouldPreserveScrollRef.current = false;
  }, [messages, isLoadingOlder]);

  /**
   * =====================================================
   * AUTO-SCROLL TO BOTTOM
   * =====================================================
   *
   * Only automatically scroll when:
   *
   * 1. The initial messages are loaded.
   * 2. A new realtime message arrives.
   *
   * Do NOT scroll to bottom when older messages are
   * loaded.
   */
  useEffect(() => {
    const previousCount = previousMessageCountRef.current;

    const currentCount = messages.length;

    const messageCountIncreased = currentCount > previousCount;

    previousMessageCountRef.current = currentCount;

    /*
     * Don't jump to bottom while loading older messages.
     */
    if (isLoadingOlder) {
      return;
    }

    /*
     * If we're preserving scroll position because older
     * messages were loaded, don't scroll to bottom.
     */
    if (shouldPreserveScrollRef.current) {
      return;
    }

    /*
     * Initial history load.
     */
    if (previousCount === 0 && currentCount > 0) {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
      });

      return;
    }

    /*
     * New message received.
     */
    if (messageCountIncreased) {
      const container = scrollContainerRef.current;

      if (!container) return;

      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      /*
       * Only auto-scroll if the user is already near
       * the bottom.
       *
       * This prevents interrupting someone who is reading
       * older messages.
       */
      if (distanceFromBottom <= 120) {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  }, [messages, isLoadingOlder]);

  /**
   * =====================================================
   * EMPTY STATE
   * =====================================================
   */
  if (messages.length === 0) {
    return (
      <div
        ref={scrollContainerRef}
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-4
          py-4
        "
        onScroll={handleScroll}
      >
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div
              className="
                mx-auto
                mb-3
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-slate-800
              "
            >
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
      </div>
    );
  }

  /**
   * =====================================================
   * MESSAGE LIST
   * =====================================================
   */
  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="
        min-h-0
        flex-1
        overflow-y-auto
        px-4
        py-4
      "
    >
      {/* Older messages loading indicator */}

      {isLoadingOlder && (
        <div className="mb-3 flex justify-center">
          <div
            className="
              rounded-lg
              border
              border-slate-800
              bg-slate-950
              px-3
              py-1.5
              text-[11px]
              text-slate-500
            "
          >
            Loading older messages...
          </div>
        </div>
      )}

      {/* Load older messages hint */}

      {!isLoadingOlder && hasMoreMessages && (
        <div className="mb-3 text-center">
          <span
            className="
                text-[10px]
                text-slate-600
              "
          >
            Scroll up to load older messages
          </span>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((message) => {
          const isOwnMessage = message.senderId?.toString() === currentUserId;

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
    </div>
  );
};

export default MessageList;
