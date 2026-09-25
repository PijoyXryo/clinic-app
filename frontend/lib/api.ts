export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// An error that remembers the HTTP status code (404, 409...)
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json();

  if (!res.ok) {
    const text = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new ApiError(text, res.status);
  }
  return data as T;
}