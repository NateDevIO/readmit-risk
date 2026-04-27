'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat, SUGGESTED_PROMPTS } from '@/lib/use-chat';
import type { Citation, Message } from '@/lib/use-chat';

/**
 * Renders the numbered "Sources" block beneath an assistant message that
 * cited retrieved chunks. Each row collapses to a one-line summary; the
 * full chunk content appears when the row is expanded.
 */
function Sources({ citations }: { citations: Citation[] }) {
  const sorted = [...citations].sort((a, b) => a.index - b.index);

  return (
    <div className="mt-2 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
        Sources
      </div>
      <ol className="space-y-1.5">
        {sorted.map((c) => (
          <li key={c.index}>
            <details className="group">
              <summary className="cursor-pointer list-none flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
                  {c.index}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {c.sample_name || c.source_id}
                  </span>
                  {c.note_type && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {' · '}
                      {c.note_type}
                    </span>
                  )}
                  {typeof c.similarity === 'number' && (
                    <span className="text-gray-400 dark:text-gray-500">
                      {' · '}
                      {(c.similarity * 100).toFixed(0)}% match
                    </span>
                  )}
                </span>
                <span className="flex-shrink-0 text-[10px] text-blue-600 dark:text-blue-400 group-open:hidden">
                  View chunk
                </span>
                <span className="flex-shrink-0 text-[10px] text-blue-600 dark:text-blue-400 hidden group-open:inline">
                  Hide
                </span>
              </summary>
              {c.content && (
                <div className="mt-1.5 ml-7 text-[11px] text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-2 whitespace-pre-wrap">
                  {c.content}
                </div>
              )}
              <div className="mt-1 ml-7 text-[10px] text-gray-400 dark:text-gray-500 font-mono break-all">
                {c.source_id}
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ChatWidget() {
  const {
    messages,
    send,
    streaming,
    activeTool,
    error,
    isOpen,
    open,
    close,
    showLabel,
  } = useChat();

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(scrollToBottom, [messages, activeTool, scrollToBottom]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
    setInput('');
  };

  const toolLabel = (name: string) =>
    name
      .replace(/^(get_|predict_|compare_)/, '')
      .replace(/_/g, ' ');

  const lastMsg = messages[messages.length - 1];
  const showDots =
    streaming &&
    !activeTool &&
    lastMsg?.role === 'assistant' &&
    !lastMsg.content;

  return (
    <>
      {/* Label tooltip */}
      <div
        className={`fixed bottom-[2.35rem] right-[5.5rem] z-50
          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
          text-xs font-medium px-3 py-1.5 rounded-full
          shadow-md border border-gray-200 dark:border-gray-600
          whitespace-nowrap
          transition-all duration-500
          ${showLabel && !isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
      >
        Ask about the data
      </div>

      {/* Floating action button */}
      <button
        onClick={open}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
          bg-blue-600 hover:bg-blue-700 text-white
          shadow-lg hover:shadow-xl
          transition-all duration-300
          flex items-center justify-center group
          animate-chat-glow
          ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open chat"
      >
        <svg
          className="w-6 h-6 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col
          w-[calc(100vw-3rem)] h-[calc(100vh-5rem)]
          sm:w-[420px] sm:h-[600px]
          bg-white dark:bg-gray-800
          rounded-2xl shadow-2xl
          border border-gray-200 dark:border-gray-700
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl flex-shrink-0">
          <div>
            <h3 className="text-white font-semibold text-sm">
              ReadmitRisk Assistant
            </h3>
            <p className="text-blue-200 text-xs">
              Ask about patient data & risk analytics
            </p>
          </div>
          <button
            onClick={close}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close chat"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Message area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
        >
          {messages.length === 0 && !streaming ? (
            /* Empty state */
            <div className="flex flex-col items-center h-full pt-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
                Explore readmission risk data with AI
              </p>
              <div className="w-full space-y-2 px-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => send(prompt)}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-xl
                      border border-gray-200 dark:border-gray-600
                      text-gray-700 dark:text-gray-300
                      hover:bg-blue-50 dark:hover:bg-blue-900/20
                      hover:border-blue-300 dark:hover:border-blue-600
                      transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'user' ? (
                    <div className="max-w-[85%] px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words bg-blue-600 text-white rounded-2xl rounded-br-md">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[85%] flex flex-col">
                      <div className="px-3.5 py-2 text-sm leading-relaxed break-words bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md chat-md">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      {msg.citations && msg.citations.length > 0 && (
                        <Sources citations={msg.citations} />
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Tool activity */}
              {activeTool && (
                <div className="flex items-center gap-2 px-1">
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Querying {toolLabel(activeTool)}...
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {showDots && (
                <div className="flex gap-1 px-3 py-2">
                  <span className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={streaming}
              className="flex-1 px-3.5 py-2 text-sm rounded-xl
                border border-gray-200 dark:border-gray-600
                bg-gray-50 dark:bg-gray-700
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="px-3 py-2 rounded-xl bg-blue-600 text-white
                hover:bg-blue-700
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors"
              aria-label="Send message"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Badge */}
        <div className="flex-shrink-0 pb-2 text-center">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            Powered by Claude + MCP
          </span>
        </div>
      </div>
    </>
  );
}
