import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { geocodeCity, postPart1 } from '../api/client.js'
import Loader from './Loader.jsx'
import ErrorBox from './ErrorBox.jsx'

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function InputForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    birth_date: '',
    birth_time: '21:00',
    city: '',
    latitude: '',
    longitude: '',
  })
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = form.city.trim()
    if (q.length < 3) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await geocodeCity(q)
        setSuggestions(results)
      } catch (err) {
        setError(err.message)
        setSuggestions([])
      } finally {
        setSearching(false)
      }
    }, 500)
    return () => debounceRef.current && clearTimeout(debounceRef.current)
  }, [form.city])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const pickSuggestion = (s) => {
    setForm((f) => ({
      ...f,
      city: s.name,
      latitude: String(s.latitude),
      longitude: String(s.longitude),
    }))
    setSuggestions([])
  }

  const clearCityForManualEntry = () => {
    setForm((f) => ({ ...f, city: '', latitude: '', longitude: '' }))
    setSuggestions([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.birth_date) {
      setError('Birth date is required.')
      return
    }
    if (form.birth_date > todayISO()) {
      setError('Birth date cannot be in the future.')
      return
    }
    const lat = parseFloat(form.latitude)
    const lon = parseFloat(form.longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be a number between -90 and 90.')
      return
    }
    if (Number.isNaN(lon) || lon < -180 || lon > 180) {
      setError('Longitude must be a number between -180 and 180.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        birth_date: form.birth_date,
        birth_time: form.birth_time || '21:00',
        latitude: lat,
        longitude: lon,
        location_name: form.city || `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
      }
      const part1 = await postPart1(payload)
      navigate('/profile', { state: { part1, birth: payload } })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="input-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label className="field">
          <span className="field-label">Birth date</span>
          <input
            type="date"
            name="birth_date"
            value={form.birth_date}
            onChange={handleChange}
            max={todayISO()}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Birth time</span>
          <input
            type="time"
            name="birth_time"
            value={form.birth_time}
            onChange={handleChange}
          />
          <span className="field-hint">Defaults to 21:00 local if unknown</span>
        </label>
      </div>

      <div className="form-section-title">Where were you born?</div>
      <div className="form-row">
        <label className="field field-grow">
          <span className="field-label">City or place name</span>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="e.g. Lahore, Pakistan"
            autoComplete="off"
          />
          {searching && <span className="field-hint">Searching…</span>}
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((s, i) => (
                <li key={`${s.latitude}-${s.longitude}-${i}`}>
                  <button type="button" onClick={() => pickSuggestion(s)}>
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </label>
      </div>

      <details className="manual-toggle">
        <summary onClick={(e) => { e.preventDefault(); clearCityForManualEntry() }}>
          Or enter coordinates manually
        </summary>
        <div className="form-row">
          <label className="field">
            <span className="field-label">Latitude</span>
            <input
              type="number"
              step="any"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="-90 to 90"
            />
          </label>
          <label className="field">
            <span className="field-label">Longitude</span>
            <input
              type="number"
              step="any"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="-180 to 180"
            />
          </label>
        </div>
      </details>

      {error && <ErrorBox message={error} />}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Calculating…' : 'Generate Stellar DNA'}
      </button>

      {submitting && <Loader label="Reconstructing your birth sky…" />}
    </form>
  )
}
