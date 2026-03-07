import { parseSSEChunk } from '@/lib/parse-sse';

describe('parseSSEChunk', () => {
  it('parses a single complete event', () => {
    const raw = 'event: text\ndata: {"text": "hello"}\n\n';
    const { events, remaining } = parseSSEChunk('', raw);

    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('text');
    expect(events[0].data).toBe('{"text": "hello"}');
    expect(remaining).toBe('');
  });

  it('parses multiple events in one chunk', () => {
    const raw =
      'event: text\ndata: {"text": "a"}\n\n' +
      'event: text\ndata: {"text": "b"}\n\n' +
      'event: done\ndata: {}\n\n';
    const { events, remaining } = parseSSEChunk('', raw);

    expect(events).toHaveLength(3);
    expect(events[0].data).toBe('{"text": "a"}');
    expect(events[1].data).toBe('{"text": "b"}');
    expect(events[2].event).toBe('done');
    expect(remaining).toBe('');
  });

  it('normalizes \\r\\n line endings to \\n', () => {
    const raw = 'event: text\r\ndata: {"text": "hi"}\r\n\r\n';
    const { events, remaining } = parseSSEChunk('', raw);

    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('text');
    expect(events[0].data).toBe('{"text": "hi"}');
    expect(remaining).toBe('');
  });

  it('handles mixed \\r\\n and \\n endings', () => {
    const raw = 'event: text\r\ndata: {"text": "mix"}\n\r\n';
    const { events, remaining } = parseSSEChunk('', raw);

    expect(events).toHaveLength(1);
    expect(events[0].data).toBe('{"text": "mix"}');
  });

  it('returns incomplete event as remaining buffer', () => {
    const raw = 'event: text\ndata: {"text": "partial';
    const { events, remaining } = parseSSEChunk('', raw);

    expect(events).toHaveLength(0);
    expect(remaining).toBe('event: text\ndata: {"text": "partial');
  });

  it('combines buffer with new raw data', () => {
    const buffer = 'event: text\ndata: {"text": "hel';
    const raw = 'lo"}\n\n';
    const { events, remaining } = parseSSEChunk(buffer, raw);

    expect(events).toHaveLength(1);
    expect(events[0].data).toBe('{"text": "hello"}');
    expect(remaining).toBe('');
  });

  it('handles split across multiple chunks', () => {
    // First chunk — incomplete
    const { events: e1, remaining: r1 } = parseSSEChunk(
      '',
      'event: text\r\nda'
    );
    expect(e1).toHaveLength(0);

    // Second chunk — completes the event
    const { events: e2, remaining: r2 } = parseSSEChunk(
      r1,
      'ta: {"text": "split"}\r\n\r\n'
    );
    expect(e2).toHaveLength(1);
    expect(e2[0].data).toBe('{"text": "split"}');
    expect(r2).toBe('');
  });

  it('parses tool_start events', () => {
    const raw =
      'event: tool_start\ndata: {"tool": "get_patient_risk_score"}\n\n';
    const { events } = parseSSEChunk('', raw);

    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('tool_start');
    expect(JSON.parse(events[0].data).tool).toBe('get_patient_risk_score');
  });

  it('parses tool_result events', () => {
    const raw =
      'event: tool_result\ndata: {"tool": "compare_datasets", "result": "..."}\n\n';
    const { events } = parseSSEChunk('', raw);

    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('tool_result');
    expect(JSON.parse(events[0].data).tool).toBe('compare_datasets');
  });

  it('parses error events', () => {
    const raw = 'event: error\ndata: {"error": "Rate limit exceeded"}\n\n';
    const { events } = parseSSEChunk('', raw);

    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('error');
    expect(JSON.parse(events[0].data).error).toBe('Rate limit exceeded');
  });

  it('skips SSE comment lines (starting with :)', () => {
    const raw = ': keepalive\n\nevent: text\ndata: {"text": "ok"}\n\n';
    const { events } = parseSSEChunk('', raw);

    // Comment-only block has no event or data, so it's skipped
    expect(events).toHaveLength(1);
    expect(events[0].data).toBe('{"text": "ok"}');
  });

  it('returns empty array for empty input', () => {
    const { events, remaining } = parseSSEChunk('', '');
    expect(events).toHaveLength(0);
    expect(remaining).toBe('');
  });

  it('handles event with no data field', () => {
    const raw = 'event: ping\n\n';
    const { events } = parseSSEChunk('', raw);

    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('ping');
    expect(events[0].data).toBe('');
  });

  it('handles realistic sse-starlette output sequence', () => {
    // Simulates what sse-starlette actually sends (\\r\\n endings)
    const raw =
      'event: text\r\ndata: {"text": "Hello"}\r\n\r\n' +
      'event: tool_start\r\ndata: {"tool": "get_risk_distribution"}\r\n\r\n' +
      'event: tool_result\r\ndata: {"tool": "get_risk_distribution", "result": "..."}\r\n\r\n' +
      'event: text\r\ndata: {"text": " The distribution shows"}\r\n\r\n' +
      'event: done\r\ndata: {}\r\n\r\n';

    const { events, remaining } = parseSSEChunk('', raw);

    expect(events).toHaveLength(5);
    expect(events.map((e) => e.event)).toEqual([
      'text',
      'tool_start',
      'tool_result',
      'text',
      'done',
    ]);
    expect(remaining).toBe('');
  });
});
