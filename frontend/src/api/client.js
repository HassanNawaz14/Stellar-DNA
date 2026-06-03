const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error(`Network error: could not reach backend at ${API_BASE}${path}.`)
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `API ${res.status}`)
  }
  return res.json()
}

export async function geocodeCity(city) {
  const query = city.trim()
  if (!query) return []
  const url = `${NOMINATIM_BASE}/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(query)}`
  let res
  try {
    res = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    })
  } catch {
    throw new Error('Geocoding service unreachable. Check your connection.')
  }
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
  const data = await res.json()
  return data.map((d) => ({
    name: d.display_name,
    latitude: parseFloat(d.lat),
    longitude: parseFloat(d.lon),
  }))
}

export function postPart1(payload) {
  return request('/part1', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function postPart2(part1Response) {
  const {
    season,
    hemisphere,
    dominant_class,
    dominant_star_example,
    spectral_weights,
    element_percentages,
    nucleosynthesis_path,
    rarest_element,
    rarest_element_origin,
  } = part1Response
  return request('/part2', {
    method: 'POST',
    body: JSON.stringify({
      season,
      hemisphere,
      dominant_class,
      dominant_star_example,
      spectral_weights,
      element_percentages,
      nucleosynthesis_path,
      rarest_element,
      rarest_element_origin,
    }),
  })
}
