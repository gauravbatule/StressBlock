// Groq API client for StressBlock AI Chat
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const STORAGE_KEY = 'stressblock_groq_key';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const SYSTEM_PROMPT = `You are "Aura", a warm, empathetic, and professional AI wellness companion built into StressBlock — a mental health & stress management app.

Your personality:
- Calm, supportive, and non-judgmental
- You speak in a warm, conversational tone — not robotic
- You use gentle encouragement and validate feelings
- You occasionally use soft emojis like 🌿, ✨, 💙, 🌙 but don't overdo it

Your capabilities:
- Help users manage stress, anxiety, and overwhelm
- Guide breathing exercises (4-7-8, box breathing, etc.)
- Suggest mindfulness and grounding techniques
- Help with sleep hygiene and relaxation tips
- Encourage journaling and self-reflection
- Provide cognitive reframing for negative thoughts
- Offer motivational support

Important rules:
- NEVER diagnose medical conditions or replace professional therapy
- If someone expresses serious distress, suicidal thoughts, or self-harm, gently encourage them to reach out to a crisis helpline or mental health professional
- Keep responses concise (2-4 paragraphs max) unless the user asks for more detail
- Reference StressBlock features when relevant (Breathing Studio, Focus Zone, Brain Training, Daily Diary, Sleep Aid)
- Always end responses with something actionable or encouraging`;

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}

export function getApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function removeApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function sendMessage(
  messages: ChatMessage[],
  apiKey: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const fullMessages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  // Use streaming if callback provided
  if (onChunk) {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Groq API key and try again.');
      }
      throw new Error(error?.error?.message || `Groq API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Stream not available');

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              onChunk(delta);
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    }

    return fullContent;
  }

  // Non-streaming fallback
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your Groq API key and try again.');
    }
    throw new Error(error?.error?.message || `Groq API error: ${response.status}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices[0]?.message?.content || 'I couldn\'t generate a response. Please try again.';
}
