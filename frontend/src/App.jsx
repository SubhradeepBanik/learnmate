import { useEffect, useState } from 'react'
import { getHealth } from './api/client'

function App() {
  const [status, setStatus] = useState('Checking backend…')

  useEffect(() => {
    getHealth()
      .then(() => setStatus('Backend is connected.'))
      .catch(() => setStatus('Backend is not running yet.'))
  }, [])

  return (
    <main>
      <p className="eyebrow">LearnMate</p>
      <h1>Your learning workspace starts here.</h1>
      <p>{status}</p>
    </main>
  )
}

export default App
