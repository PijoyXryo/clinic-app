export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// <T> = "tell me what type of data you expect back"
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json();

  if (!res.ok) {
    const text = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new Error(text);
  }
  return data as T;
}