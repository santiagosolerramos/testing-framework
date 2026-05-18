const MOCK_RESPONSES = [
  "Hi there! I'm your AI assistant. How can I help you today?",
  "That's a great question! Let me look into that for you.",
  "I understand your concern. Here's what I can do to help...",
  "Thanks for reaching out! I've reviewed your request and here's what I found.",
  "I'd be happy to assist with that. Could you provide a bit more detail?",
  "Based on the information you've provided, I recommend the following steps.",
  "I've processed your request. Is there anything else I can help you with?",
  "Great news! I was able to find a solution for your issue.",
  "I apologize for the inconvenience. Let me escalate this to our team.",
  "Your feedback is important to us. I'll make sure this is addressed.",
]

export async function mockInvokeAgent(userMessage: string): Promise<string> {
  // Simulate network latency
  const delay = 800 + Math.random() * 1200
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Simple keyword-based responses for demo
  const lower = userMessage.toLowerCase()
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I'm your AI assistant. How can I help you today?"
  }
  if (lower.includes('order') || lower.includes('track')) {
    return "I can help you track your order. Could you please provide your order number?"
  }
  if (lower.includes('refund') || lower.includes('return')) {
    return "I understand you'd like a refund. Our return policy allows returns within 30 days of purchase. I'll initiate the process for you."
  }
  if (lower.includes('billing') || lower.includes('payment') || lower.includes('charge')) {
    return "I see you have a billing concern. Let me pull up your account details to investigate this further."
  }
  if (lower.includes('error') || lower.includes('bug') || lower.includes('issue')) {
    return "I'm sorry to hear you're experiencing an issue. Let me troubleshoot this with you step by step."
  }

  // Fallback random response
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]
}
