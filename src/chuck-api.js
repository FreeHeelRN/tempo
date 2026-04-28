// Wrapper to use OpenClaw webhooks for chat-like responses
// since direct /v1/chat/completions has CORS issues

export async function sendMessageToChuck(messages) {
  // Extract the last user message
  const lastMessage = messages[messages.length - 1];
  
  // Use webhook endpoint which should have CORS or be proxied properly
  const response = await fetch('https://c3-0108.c3.heyron.ai/hooks/agent', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer token-07ed1b603e23d289e29f135b15689f99',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: lastMessage.content,
      deliver: false,
      agentId: 'main',
      sessionKey: `tempo:${Date.now()}`,
      wakeMode: 'now'
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  // Webhook returns immediately but processes async
  // For now, return a mock response and we'll handle async later
  return {
    choices: [{
      message: {
        content: "Processing your request... (webhook limitation - responses will be async)"
      }
    }]
  };
}
