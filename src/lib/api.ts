const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://field-be-production.up.railway.app' : '');

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}
