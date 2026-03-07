export interface SSEEvent {
  event: string;
  data: string;
}

/**
 * Parse a raw SSE chunk into structured events.
 * Normalizes \r\n to \n, splits on double-newline boundaries,
 * and returns parsed events plus any remaining buffer.
 */
export function parseSSEChunk(
  buffer: string,
  raw: string
): { events: SSEEvent[]; remaining: string } {
  let combined = buffer + raw;
  combined = combined.replace(/\r\n/g, '\n');

  const parts = combined.split('\n\n');
  const remaining = parts.pop() || '';
  const events: SSEEvent[] = [];

  for (const part of parts) {
    let event = '';
    let data = '';
    for (const line of part.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data = line.slice(5).trim();
    }
    if (event || data) {
      events.push({ event, data });
    }
  }

  return { events, remaining };
}
