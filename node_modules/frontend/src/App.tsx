import { useEffect, useState } from 'react'

type MapData = {
  layout: string[]
  bookedCabanas: string[]
}

export default function App() {
  const [mapData, setMapData] = useState<MapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCabana, setSelectedCabana] = useState<{ x: number, y: number } | null>(null)
  const [room, setRoom] = useState('')
  const [guestName, setGuestName] = useState('')
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const fetchMap = async () => {
    try {
      const res = await fetch('/api/map')
      if (!res.ok) throw new Error('Failed to fetch map data')
      const data = await res.json()
      setMapData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMap()
  }, [])

  const handleBookCabana = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCabana) return

    setBookingError(null)
    setBookingSuccess(false)

    try {
      const res = await fetch('/api/cabanas/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x: selectedCabana.x,
          y: selectedCabana.y,
          room,
          guestName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to book cabana')
      }

      setBookingSuccess(true)
      setTimeout(() => {
        setSelectedCabana(null)
        setBookingSuccess(false)
        setRoom('')
        setGuestName('')
        fetchMap() // Refresh map to show booked cabana
      }, 2000)

    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const renderCell = (char: string, x: number, y: number) => {
    const isBooked = mapData?.bookedCabanas.includes(`${x},${y}`)
    
    let cellClass = 'map-cell '
    let imageSrc = ''
    
    switch (char) {
      case 'W':
        cellClass += 'cabana ' + (isBooked ? 'booked' : '')
        imageSrc = '/assets/cabana.png'
        break
      case 'p':
        cellClass += 'pool'
        break
      case 'c':
        cellClass += 'chalet'
        imageSrc = '/assets/houseChimney.png'
        break
      case '#':
        cellClass += 'path'
        break
      case '.':
        cellClass += 'grass'
        break
      default:
        break
    }

    return (
      <div 
        key={`${x}-${y}`} 
        className={cellClass}
        onClick={() => {
          if (char === 'W' && !isBooked) {
            setSelectedCabana({ x, y })
          }
        }}
      >
        {imageSrc && <img src={imageSrc} alt={char} />}
      </div>
    )
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="error-message">Error: {error}</div>

  return (
    <>
      <div>
        <h1>Resort Oasis</h1>
        <p className="subtitle">Interactive Cabana Booking</p>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-swatch" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '2px solid var(--success)' }}>
            <img src="/assets/cabana.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Available" />
          </div>
          <span>Available Cabana</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch" style={{ filter: 'grayscale(80%) sepia(50%) hue-rotate(300deg) saturate(300%)', opacity: 0.6, position: 'relative' }}>
            <img src="/assets/cabana.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Booked" />
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.8rem' }}>❌</span>
          </div>
          <span>Booked Cabana</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch grass"></div>
          <span>Grass</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch path"></div>
          <span>Path</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch pool"></div>
          <span>Pool</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch chalet">
            <img src="/assets/houseChimney.png" style={{ width: '90%', height: '90%', objectFit: 'contain' }} alt="Chalet" />
          </div>
          <span>Chalet</span>
        </div>
      </div>

      <div className="map-container">
        {mapData?.layout.map((row, y) => (
          <div key={y} className="map-row">
            {row.split('').map((char, x) => renderCell(char, x, y))}
          </div>
        ))}
      </div>

      {selectedCabana && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedCabana(null)
        }}>
          <div className="modal-content">
            <h2 className="modal-title">Book Cabana</h2>
            
            {bookingSuccess ? (
              <div style={{ color: 'var(--success)', textAlign: 'center', fontWeight: 'bold' }}>
                🎉 Cabana successfully booked!
              </div>
            ) : (
              <form onSubmit={handleBookCabana}>
                {bookingError && <div className="error-message">{bookingError}</div>}
                
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    placeholder="e.g. 101"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Guest Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="e.g. Alice Smith"
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedCabana(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Book Now</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
