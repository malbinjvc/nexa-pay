export function useApi() {
  const config = useRuntimeConfig();
  const { session } = useAuth();

  async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = session.value?.access_token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${config.public.apiUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  function get<T>(path: string) {
    return apiFetch<T>(path);
  }

  function post<T>(path: string, body?: unknown) {
    return apiFetch<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  function put<T>(path: string, body: unknown) {
    return apiFetch<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  function del<T>(path: string) {
    return apiFetch<T>(path, { method: 'DELETE' });
  }

  return { get, post, put, del };
}
