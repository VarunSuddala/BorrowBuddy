const configuredApiUrl = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV
    ? 'http://localhost:3000/api'
    : 'https://borrowbuddy-oklz.onrender.com/api')

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '')
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')
export const getAssetUrl = path => `${API_ORIGIN}/${String(path).replace(/^\/+/, '')}`

export const getAuthHeaders = (token = localStorage.getItem('token')) => (
  token ? { Authorization: `Bearer ${token}` } : {}
)

export async function apiRequest(path, options = {}, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...getAuthHeaders(token),
      ...(options.headers || {}),
    },
  })
  const responseText = await response.text()
  let data = null

  if (responseText.trim()) {
    try {
      data = JSON.parse(responseText)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    if ([502, 503, 504].includes(response.status)) {
      throw new Error(`API server is unavailable (HTTP ${response.status}). Check that the backend is running and try again.`)
    }
    throw new Error(data?.message || `Request failed (HTTP ${response.status}).`)
  }

  if (!data) {
    throw new Error('The API returned an empty or invalid response. Please try again.')
  }

  if (!data.success) {
    throw new Error(data.message || 'Request failed')
  }
  return data
}
