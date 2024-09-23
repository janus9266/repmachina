import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Set headers for SSE
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  return new Response(new ReadableStream({
    start(controller) {
      // Function to send a message
      function sendMessage(data: string) {
        controller.enqueue(`data: ${data}\n\n`);
      }

      // Example: Send a message every 2 seconds
      const intervalId = setInterval(() => {
        const message = JSON.stringify({ time: new Date().toISOString() });
        sendMessage(message);
      }, 2000);

      // Close the connection if the stream is canceled
      req.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  }), {
    headers,
  });
}