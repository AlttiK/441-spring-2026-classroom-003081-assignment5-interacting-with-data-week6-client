import { type SubmitEvent, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const API_LOC = import.meta.env.VITE_API_LOC

export function SightingsPage() {
  const [parkId, setParkId] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePath, setImagePath] = useState('');
  const [userId, setUserId] = useState('');
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [notes, setNotes] = useState('');
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  const [sightings, setSightings] = useState<any[]>([])
  const [sightingsError, setSightingsError] = useState<string | null>(null)
  const [sightingsLoading, setSightingsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in.
    // Form should only be displayed to authenticated users, and
    // the user's ID needs to be included in the created sighting.
    void supabase.auth.getSession().then(({ data }) => {
      if(data.session){
        setUserId(data.session.user.id)
      }else {
        setAuthErrorMessage("Please log in to create a sighting")
      }
    })
  }, [])

  useEffect(() => {
    async function loadSightings() {
      try {
        const res = await fetch(`${API_LOC}/sightings`)

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`)
        }

        const data = await res.json()
        setSightings(data)
        setSightingsError(null)
      } catch (err) {
        console.error(err)
        setSightings([])
        setSightingsError('Could not load sightings.')
      } finally {
        setSightingsLoading(false)
      }
    }

    void loadSightings()
  }, [])

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    console.log({
      parkId,
      speciesId,
      dateTime,
      lat,
      long,
      notes,
    })
    const { error } = await supabase
      .from('Sightings')
      .insert({ ParkID: parkId, SpeciesID: speciesId, DateTime: dateTime, ImagePath: imagePath, UserID: userId, Notes: notes, Lat: lat, Long: long})
    if (error) {
      console.log("insert error", error)
    }
    setParkId('')
    setSpeciesId('')
    setDateTime('')
    setLat('')
    setLong('')
    setNotes('')
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  async function onFileUpload() {
    if (!selectedFile) return;
    console.log(selectedFile);
    // Filename needs to only use "S3 safe characters" https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
    // This appends epoch time stamp and truncates before any spaces
    let santizedFilename = `${Date.now()}-${selectedFile.name.split(' ')[0]}`

    const { data, error } = await supabase.storage.from('SightingImages').upload(santizedFilename, selectedFile)
    if (error) {
      console.log("upload error", error)
    } else {
      console.log("upload data ", data)
      // The data returned has keys of path, id, and fullPath.
      // When we create the sightings record with the other form data,
      // we want to add the path to it.
      setImagePath(data.path);
    }
  }

  return (
    <div>
      <h1>Sightings</h1>
      <h2>New sighting (demo form)</h2>
      <div>
        {
          authErrorMessage
          ? authErrorMessage
          :

          <div>
            <input type="file" onChange={onFileChange} />
            <button onClick={onFileUpload}>Upload!</button>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="s-park">
                  Park id{' '}
                  <input
                    id="s-park"
                    value={parkId}
                    onChange={(e) => setParkId(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label htmlFor="s-species">
                  Species id{' '}
                  <input
                    id="s-species"
                    value={speciesId}
                    onChange={(e) => setSpeciesId(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label htmlFor="s-when">
                  Date / time{' '}
                  <input
                    id="s-when"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label htmlFor="s-lat">
                  Lat{' '}
                  <input
                    id="s-lat"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label htmlFor="s-long">
                  Long{' '}
                  <input
                    id="s-long"
                    value={long}
                    onChange={(e) => setLong(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label htmlFor="s-notes">
                  Notes{' '}
                  <input
                    id="s-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
              </div>
              <button type="submit">Submit</button>
            </form>
          </div>
        }
      </div>
      <h2>All sightings</h2>
      {sightingsLoading && <p>Loading sightings...</p>}
      {sightingsError && <p>{sightingsError}</p>}
      {!sightingsLoading && !sightingsError && (
        <ul>
          {sightings.map((s: any) => (
            <li key={s.ID}>
              park {s.ParkID}, species {s.SpeciesID}, {s.DateTime}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
