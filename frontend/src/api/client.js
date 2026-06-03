const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json()
}

export function submitBirth(payload) {
  return request('/part1', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchPart2(payload) {
  return request('/part2', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
