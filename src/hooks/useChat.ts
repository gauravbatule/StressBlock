import { useState, useCallback, useRef } from 'react';
import { sendMessage, getApiKey } from '../lib/groq';
import type { ChatMessage } from '../lib/groq';

const HISTORY_KEY = 'stressblock_chat_history';
const MAX_HISTORY = 50;

export interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function loadHistory(): ChatEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: ChatEntry[]): void {
  const trimmed = entries.slice(-MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function useChat() {
  const [messages, setMessages] = useState<ChatEntry[]>(loadHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const abortRef = useRef(false);

  const send = useCallback(async (userMessage: string) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Please add your Groq API key first.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setStreamingContent('');
    abortRef.current = false;

    const userEntry: ChatEntry = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userEntry];
    setMessages(newMessages);
    saveHistory(newMessages);

    // Build context (last 10 messages for context window)
    const contextMessages: ChatMessage[] = newMessages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      let accumulated = '';
      const fullContent = await sendMessage(contextMessages, apiKey, (chunk) => {
        if (abortRef.current) return;
        accumulated += chunk;
        setStreamingContent(accumulated);
      });

      if (!abortRef.current) {
        const assistantEntry: ChatEntry = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fullContent,
          timestamp: Date.now(),
        };

        const finalMessages = [...newMessages, assistantEntry];
        setMessages(finalMessages);
        saveHistory(finalMessages);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  return {
    messages,
    isLoading,
    error,
    streamingContent,
    send,
    clearHistory,
  };
}
