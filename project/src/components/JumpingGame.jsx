import { useState, useEffect, useCallback } from 'react'
import { Button, Card, Typography, Space } from 'antd'

const { Title, Text } = Typography

function JumpingGame() {
  const [gameState, setGameState] = useState('idle') // idle, playing, gameOver
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [playerY, setPlayerY] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [obstacles, setObstacles] = useState([])
  const [gameSpeed, setGameSpeed] = useState(2)

  const JUMP_HEIGHT = 150
  const JUMP_DURATION = 600
  const PLAYER_WIDTH = 40
  const PLAYER_HEIGHT = 40
  const OBSTACLE_WIDTH = 30
  const OBSTACLE_HEIGHT = 40
  const GROUND_HEIGHT = 100

  useEffect(() => {
    const savedHighScore = localStorage.getItem('jumpingGameHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
  }, [])

  const jump = useCallback(() => {
    if (gameState !== 'playing' || isJumping) return
    
    setIsJumping(true)
    setPlayerY(JUMP_HEIGHT)
    
    setTimeout(() => {
      setPlayerY(0)
      setIsJumping(false)
    }, JUMP_DURATION)
  }, [gameState, isJumping])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setPlayerY(0)
    setIsJumping(false)
    setObstacles([])
    setGameSpeed(2)
  }

  const endGame = () => {
    setGameState('gameOver')
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('jumpingGameHighScore', score.toString())
    }
  }

  const resetGame = () => {
    setGameState('idle')
    setScore(0)
    setPlayerY(0)
    setIsJumping(false)
    setObstacles([])
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        if (gameState === 'playing') {
          jump()
        } else if (gameState === 'idle') {
          startGame()
        } else if (gameState === 'gameOver') {
          resetGame()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, jump])

  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = setInterval(() => {
      setObstacles(prev => {
        const newObstacles = prev.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - gameSpeed
        })).filter(obstacle => obstacle.x > -OBSTACLE_WIDTH)

        if (Math.random() < 0.02) {
          newObstacles.push({
            x: 800,
            y: GROUND_HEIGHT,
            width: OBSTACLE_WIDTH,
            height: OBSTACLE_HEIGHT
          })
        }

        const playerRect = {
          x: 100,
          y: GROUND_HEIGHT - PLAYER_HEIGHT - playerY,
          width: PLAYER_WIDTH,
          height: PLAYER_HEIGHT
        }

        const collision = newObstacles.some(obstacle => {
          return playerRect.x < obstacle.x + obstacle.width &&
                 playerRect.x + playerRect.width > obstacle.x &&
                 playerRect.y < obstacle.y + obstacle.height &&
                 playerRect.y + playerRect.height > obstacle.y
        })

        if (collision) {
          endGame()
          return []
        }

        return newObstacles
      })

      setScore(prev => prev + 1)
      setGameSpeed(prev => Math.min(prev + 0.001, 5))
    }, 16)

    return () => clearInterval(gameLoop)
  }, [gameState, playerY, gameSpeed])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <Title level={1} className="text-white mb-2">🦘 Jumping Game</Title>
          <div className="flex justify-center gap-8 mb-4">
            <Text className="text-white text-lg">Score: {score}</Text>
            <Text className="text-white text-lg">High Score: {highScore}</Text>
          </div>
        </div>

        <Card className="mb-4 bg-white/90 backdrop-blur">
          <div 
            className="relative bg-gradient-to-b from-sky-200 to-green-300 rounded-lg overflow-hidden"
            style={{ height: '300px', cursor: gameState === 'playing' ? 'pointer' : 'default' }}
            onClick={gameState === 'playing' ? jump : undefined}
          >
            <div 
              className="absolute bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center text-lg transition-all duration-150"
              style={{
                left: '100px',
                bottom: `${GROUND_HEIGHT - PLAYER_HEIGHT - playerY}px`,
                width: `${PLAYER_WIDTH}px`,
                height: `${PLAYER_HEIGHT}px`,
                transform: isJumping ? 'rotate(15deg)' : 'rotate(0deg)'
              }}
            >
              😊
            </div>

            {obstacles.map((obstacle, index) => (
              <div
                key={index}
                className="absolute bg-red-600 rounded"
                style={{
                  left: `${obstacle.x}px`,
                  bottom: `${obstacle.y}px`,
                  width: `${obstacle.width}px`,
                  height: `${obstacle.height}px`
                }}
              />
            ))}

            <div 
              className="absolute bottom-0 left-0 right-0 bg-green-500 border-t-4 border-green-600"
              style={{ height: `${GROUND_HEIGHT}px` }}
            />

            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="text-center text-white">
                  <Title level={2} className="text-white mb-4">Ready to Jump?</Title>
                  <Text className="text-white block mb-4">Press SPACE or click to jump over obstacles!</Text>
                  <Button type="primary" size="large" onClick={startGame}>
                    Start Game
                  </Button>
                </div>
              </div>
            )}

            {gameState === 'gameOver' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <Title level={2} className="text-white mb-2">Game Over!</Title>
                  <Text className="text-white block mb-2">Final Score: {score}</Text>
                  {score === highScore && score > 0 && (
                    <Text className="text-yellow-300 block mb-4">🎉 New High Score!</Text>
                  )}
                  <Button type="primary" size="large" onClick={resetGame}>
                    Play Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="text-center">
          <Space direction="vertical" size="small">
            <Text className="text-white">
              {gameState === 'playing' ? 'Press SPACE or click to jump!' : 'Use SPACE key or click to control'}
            </Text>
            <Text className="text-white/80 text-sm">
              Jump over the red obstacles to score points. The game gets faster as you progress!
            </Text>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default JumpingGame