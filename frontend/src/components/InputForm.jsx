import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitBirth } from '../api/client.js'

export default function InputForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    date: '',
    time: '',
    latitude: '',
    longitude: '',
    locationName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await submitBirth(form)
      navigate('/profile', { state: data })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Birth date
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Birth time
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Latitude
        <input
          type="number"
          step="any"
          name="latitude"
          value={form.latitude}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Longitude
        <input
          type="number"
          step="any"
          name="longitude"
          value={form.longitude}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Location name
        <input
          type="text"
          name="locationName"
          value={form.locationName}
          onChange={handleChange}
          placeholder="City, Country"
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Calculating...' : 'Generate Stellar DNA'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
