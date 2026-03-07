import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import ChatWidget from '@/components/ChatWidget';

// Mock react-markdown since it uses ESM and doesn't play well with Jest
jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown">{children}</div>;
  };
});

jest.mock('remark-gfm', () => () => {});

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.useFakeTimers();
  mockFetch.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ChatWidget', () => {
  describe('FAB button', () => {
    it('renders the floating action button', () => {
      render(<ChatWidget />);
      expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
    });

    it('opens the chat panel when FAB is clicked', () => {
      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));
      expect(screen.getByText('ReadmitRisk Assistant')).toBeVisible();
    });

    it('hides FAB when panel is open', () => {
      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));
      expect(screen.getByLabelText('Open chat')).toHaveClass('pointer-events-none');
    });
  });

  describe('chat panel', () => {
    it('shows panel header with title and subtitle', () => {
      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      expect(screen.getByText('ReadmitRisk Assistant')).toBeInTheDocument();
      expect(
        screen.getByText('Ask about patient data & risk analytics')
      ).toBeInTheDocument();
    });

    it('closes panel when X button is clicked', () => {
      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));
      expect(screen.getByLabelText('Close chat')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Close chat'));
      // Panel should be scaled down (pointer-events-none)
      const panel = screen.getByText('ReadmitRisk Assistant').closest(
        '[class*="origin-bottom-right"]'
      );
      expect(panel).toHaveClass('pointer-events-none');
    });

    it('shows powered by badge', () => {
      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));
      expect(screen.getByText('Powered by Claude + MCP')).toBeInTheDocument();
    });
  });

  describe('suggested prompts', () => {
    it('displays all 5 guided prompt buttons in empty state', () => {
      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      expect(
        screen.getByText(
          'Look up a critical-tier patient and explain their risk factors'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('Compare the UCI and MIMIC datasets')
      ).toBeInTheDocument();
      expect(
        screen.getByText('What are the top 10 readmission risk factors?')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Predict risk for a 72-year-old/)
      ).toBeInTheDocument();
      expect(
        screen.getByText("What are the model's limitations?")
      ).toBeInTheDocument();
    });

    it('shows empty state description', () => {
      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));
      expect(
        screen.getByText('Explore readmission risk data with AI')
      ).toBeInTheDocument();
    });
  });

  describe('message sending', () => {
    it('sends message on form submit', async () => {
      // Set up a mock that returns an empty SSE stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode('event: done\ndata: {}\n\n')
          );
          controller.close();
        },
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: stream,
      });

      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.change(input, { target: { value: 'test message' } });
      fireEvent.submit(input.closest('form')!);

      // User message should appear
      expect(screen.getByText('test message')).toBeInTheDocument();

      // Verify fetch was called with correct payload
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test message'),
        })
      );
    });

    it('sends prompt text when prompt button is clicked', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode('event: done\ndata: {}\n\n')
            );
            controller.close();
          },
        }),
      });

      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));
      fireEvent.click(
        screen.getByText('Compare the UCI and MIMIC datasets')
      );

      // Prompt appears as user message
      expect(
        screen.getByText('Compare the UCI and MIMIC datasets')
      ).toBeInTheDocument();

      // Fetch was called
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.messages[0].content).toBe(
        'Compare the UCI and MIMIC datasets'
      );
      expect(body.project).toBe('readmitrisk');
    });

    it('disables input while streaming', async () => {
      // Fetch that never resolves (simulates streaming)
      mockFetch.mockReturnValueOnce(
        new Promise(() => {})
      );

      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.submit(input.closest('form')!);

      // Input should be disabled during streaming
      await waitFor(() => {
        expect(input).toBeDisabled();
      });
    });

    it('clears input after sending', () => {
      mockFetch.mockReturnValueOnce(new Promise(() => {}));

      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.submit(input.closest('form')!);

      expect(input).toHaveValue('');
    });

    it('does not send empty messages', () => {
      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.submit(input.closest('form')!);

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('streaming response', () => {
    it('displays streamed text content', async () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              'event: text\ndata: {"text": "Hello "}\n\n' +
                'event: text\ndata: {"text": "world"}\n\n' +
                'event: done\ndata: {}\n\n'
            )
          );
          controller.close();
        },
      });
      mockFetch.mockResolvedValueOnce({ ok: true, body: stream });

      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.change(input, { target: { value: 'hi' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText('Hello world')).toBeInTheDocument();
      });
    });

    it('handles \\r\\n line endings from sse-starlette', async () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              'event: text\r\ndata: {"text": "works"}\r\n\r\n' +
                'event: done\r\ndata: {}\r\n\r\n'
            )
          );
          controller.close();
        },
      });
      mockFetch.mockResolvedValueOnce({ ok: true, body: stream });

      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText('works')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('shows error on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('shows error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () =>
          Promise.resolve({ error: 'Rate limit exceeded. Try again in a minute.' }),
      });

      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(
          screen.getByText('Rate limit exceeded. Try again in a minute.')
        ).toBeInTheDocument();
      });
    });

    it('shows error from SSE error event', async () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              'event: error\ndata: {"error": "MCP server unavailable"}\n\n' +
                'event: done\ndata: {}\n\n'
            )
          );
          controller.close();
        },
      });
      mockFetch.mockResolvedValueOnce({ ok: true, body: stream });

      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(
          screen.getByText('MCP server unavailable')
        ).toBeInTheDocument();
      });
    });

    it('removes empty assistant message on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fail'));

      render(<ChatWidget />);
      fireEvent.click(screen.getByLabelText('Open chat'));

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText('fail')).toBeInTheDocument();
      });

      // Only the user message bubble should exist, no empty assistant bubble
      const bubbles = screen
        .getAllByText(/.+/)
        .filter(
          (el) =>
            el.closest('[class*="rounded-2xl rounded-bl-md"]') !== null
        );
      // No assistant message with empty content
      expect(
        screen.queryByTestId('markdown')
      ).not.toBeInTheDocument();
    });
  });

  describe('label tooltip', () => {
    it('shows label on initial render', () => {
      render(<ChatWidget />);
      const label = screen.getByText('Ask about the data');
      expect(label).toHaveClass('opacity-100');
    });

    it('hides label after 5 seconds', () => {
      render(<ChatWidget />);
      const label = screen.getByText('Ask about the data');
      expect(label).toHaveClass('opacity-100');

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(label).toHaveClass('opacity-0');
    });

    it('hides label immediately when chat opens', () => {
      render(<ChatWidget />);
      const label = screen.getByText('Ask about the data');
      expect(label).toHaveClass('opacity-100');

      fireEvent.click(screen.getByLabelText('Open chat'));

      expect(label).toHaveClass('opacity-0');
    });
  });

  describe('open-chat custom event', () => {
    it('opens the panel when open-chat event is dispatched', () => {
      render(<ChatWidget />);

      act(() => {
        window.dispatchEvent(new Event('open-chat'));
      });

      expect(screen.getByText('ReadmitRisk Assistant')).toBeVisible();
    });
  });
});
