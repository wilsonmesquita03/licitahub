import { useState, useEffect } from 'react';
import { useScrollToBottom } from './use-scroll-to-bottom';
import type { UseAssistantHelpers, UseChatHelpers } from '@ai-sdk/react';

export function useMessages({
  chatId,
  status,
}: {
  chatId: string;
  status: UseAssistantHelpers['status'];
}) {
  const {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  } = useScrollToBottom();

  const [hasSentMessage, setHasSentMessage] = useState(false);

  useEffect(() => {
    if (chatId) {
      scrollToBottom('instant');
      setHasSentMessage(false);
    }
  }, [chatId, scrollToBottom]);

  useEffect(() => {
    if (status === 'in_progress') {
      setHasSentMessage(true);
    }
  }, [status]);

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  };
}
