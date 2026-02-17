// Next.js fetch configuration
// Global configuration for fetch requests in the application

export async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
  const fullURL = url.startsWith("http") ? url : `${baseURL}${url}`;

  const response = await fetch(fullURL, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchAPIWithAuth<T>(
  url: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  return fetchAPI<T>(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
}
