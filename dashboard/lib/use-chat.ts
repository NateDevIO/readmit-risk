'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { parseSSEChunk } from '@/lib/parse-sse';

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:8000';

export const SUGGESTED_PROMPTS = [
  'Look up a critical-tier patient and explain their risk factors',
  'Compare the UCI and MIMIC datasets',
  'What are the top 10 readmission risk factors?',
  'Predict risk for a 72-year-old with 8 days in hospital, 18 medications, 9 diagnoses, and 3 prior inpatient visits',
  "What are the model's limitations?",
];

/**
 * One retrieved chunk surfaced as a numbered citation. ``index`` is
 * 1-based and unique across the whole assistant turn — it matches the
 * ``[N]`` markers the model emits in the response text.
 */
export interface Citation {
  index: number;
  tool: 'search_clinical_notes' | 'find_similar_cases';
  source_id: string;
  note_type: string | null;
  content: string | null;
  similarity: number | null;
  sample_name: string | null;
  medical_specialty: string | null;
  soap_section?: string | null;
  chunk_index?: number | null;
  total_chunks?: number | null;
  matching_chunks_count?: number | null;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

export function useChat(): {
  messages: Message[];
  send: (text: string) => void;
  streaming: boolean;
  activeTool: string | null;
  error: string | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  showLabel: boolean;
} {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLabel, setShowLabel] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-hide label after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowLabel(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Hide label immediately when chat opens
  useEffect(() => {
    if (isOpen) setShowLabel(false);
  }, [isOpen]);

  // Listen for external open-chat events (e.g. from homepage CTA)
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-chat', handler);
    return () => window.removeEventListener('open-chat', handler);
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;

      const userMsg: Message = { role: 'user', content: text.trim() };
      const conversation = [...messages, userMsg];
      setMessages([...conversation, { role: 'assistant', content: '' }]);
      setError(null);
      setStreaming(true);
      setActiveTool(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversation.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            project: 'readmitrisk',
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `Server error (${res.status})`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const raw = decoder.decode(value, { stream: true });
          const { events, remaining } = parseSSEChunk(buffer, raw);
          buffer = remaining;

          for (const sseEvent of events) {
            if (!sseEvent.data) continue;

            try {
              const parsed = JSON.parse(sseEvent.data);
              if (sseEvent.event === 'text' && parsed.text) {
                assistantText += parsed.text;
                setMessages((prev) => {
                  const next = [...prev];
                  // Preserve any fields (e.g. citations) attached earlier
                  // in this same turn so successive text deltas don't
                  // wipe them out.
                  next[next.length - 1] = {
                    ...next[next.length - 1],
                    role: 'assistant',
                    content: assistantText,
                  };
                  return next;
                });
                setActiveTool(null);
              } else if (sseEvent.event === 'tool_start') {
                setActiveTool(parsed.tool || 'tool');
              } else if (sseEvent.event === 'tool_result') {
                setActiveTool(null);
              } else if (sseEvent.event === 'citations') {
                const incoming = (parsed.citations || []) as Citation[];
                if (incoming.length > 0) {
                  setMessages((prev) => {
                    const next = [...prev];
                    const last = next[next.length - 1];
                    if (last?.role === 'assistant') {
                      next[next.length - 1] = {
                        ...last,
                        citations: [...(last.citations || []), ...incoming],
                      };
                    }
                    return next;
                  });
                }
              } else if (sseEvent.event === 'error') {
                setError(parsed.error || 'Something went wrong');
              }
            } catch {
              /* skip malformed events */
            }
          }
        }

        // Remove empty assistant message if nothing came through
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return last?.role === 'assistant' && !last.content
            ? prev.slice(0, -1)
            : prev;
        });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to reach the assistant. Please try again.'
        );
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return last?.role === 'assistant' && !last.content
            ? prev.slice(0, -1)
            : prev;
        });
      } finally {
        setStreaming(false);
        setActiveTool(null);
        abortRef.current = null;
      }
    },
    [messages, streaming]
  );

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setIsOpen(false);
    setStreaming(false);
    setActiveTool(null);
  }, []);

  return { messages, send, streaming, activeTool, error, isOpen, open, close, showLabel };
}
