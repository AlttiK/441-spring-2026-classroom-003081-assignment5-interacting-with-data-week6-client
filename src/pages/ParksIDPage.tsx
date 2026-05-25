import { type FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export function ParksIDPage() {
  const { id } = useParams()
  const [sightings, setSightings] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [since, setSince] = useState('')
  const [before, setBefore] = useState('')

  useEffect(() => {
    async function loadSightings() {
      if (!id) return
      setLoading(true)
      try {
        const params = new URLSearchParams({ park_id: id })

        if (since) params.set('since', since)
        if (before) params.set('before', before)

        const res = await fetch(`/api/sightings?${params.toString()}`)

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`)
        }

        const data = await res.json()

        setSightings(data)
        setError(null)
      } catch (err) {
        console.error(err)
        setSightings([])
        setError('Could not load sightings.')
      } finally {
        setLoading(false)
      }
    }

    void loadSightings()
  }, [id, since, before])

  function handleClear() {
    setSince('')
    setBefore('')
  }

  return (
    <div>
      <h1>Sightings in Park {id}</h1>
      <div>
        <label>
          Since{' '}
          <input
            type="datetime-local"
            value={since}
            onChange={(e) => setSince(e.target.value)}
          />
        </label>
        <label>
          Before{' '}
          <input
            type="datetime-local"
            value={before}
            onChange={(e) => setBefore(e.target.value)}
          />
        </label>
        <button type="button" onClick={handleClear}>
          Clear
        </button>
      </div>
      <h2>Sightings</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && sightings.length === 0 && (
        <p>No sightings found.</p>
      )}
      {!loading && !error && sightings.length > 0 && (
        <ul>
          {sightings.map((s: any) => (
            <li key={s.ID}>
              <div>ParkID: {s.ParkID ?? ''}</div>
              <div>SpeciesID: {s.SpeciesID ?? ''}</div>
              <div>UserID: {s.UserID ?? ''}</div>
              <div>DateTime: {s.DateTime ?? ''}</div>
              <div>Notes: {s.Notes ?? ''}</div>
              <div>Lat: {s.Lat ?? ''}</div>
              <div>Long: {s.Long ?? ''}</div>
              <div>Comments: {s.Comments ?? ''}</div>
              <div>ImagePath: {s.ImagePath ?? ''}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}