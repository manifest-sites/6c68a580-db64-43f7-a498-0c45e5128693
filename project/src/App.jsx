import { useState, useEffect } from 'react'
import Monetization from './components/monetization/Monetization'
import JumpingGame from './components/JumpingGame'

function App() {

  return (
    <Monetization>
      <JumpingGame />
    </Monetization>
  )
}

export default App