const BASE_URL = "http://localhost:3000"

function getToken() {
  return localStorage.getItem("token")
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Something went wrong")
  return data
}