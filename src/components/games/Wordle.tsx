import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const WORDS = [
  'array', 'build', 'cache', 'debug', 'event', 'fetch', 'graph', 'hooks',
  'index', 'joint', 'knock', 'label', 'macro', 'noble', 'outer', 'parse',
  'queue', 'react', 'stack',   'trace', 'union', 'value', 'while', 'yield',
  'scope', 'final', 'class', 'shift', 'clone', 'token', 'throw', 'async',
  'await', 'proxy', 'vigor', 'modem', 'pixel', 'route', 'tuple',
  'codec', 'delta', 'epoch', 'forge', 'giant', 'infer', 'ivory', 'joule',
  'karma', 'layer', 'mouse', 'ninja', 'oxide', 'proxy', 'query', 'recur',
  'state', 'topic', 'ultra', 'vowel', 'xenon', 'yacht', 'zeros', 'blend',
  'cable', 'drift', 'elite', 'flame', 'grind', 'hover', 'input', 'jumps',
  'knots', 'loops', 'match', 'nests', 'opera', 'print', 'rules', 'shift',
  'tasks', 'under', 'virus', 'wheel', 'xerox', 'yours', 'zones', 'align',
  'block', 'chain', 'debut', 'every', 'fiber', 'glyph', 'input', 'jumps',
  'knobs', 'legal', 'merge', 'nexus', 'ocean', 'power', 'quote', 'reign',
  'solar', 'theme', 'ultra', 'vivid', 'wider', 'xenon', 'youth', 'zones',
]

const ROWS = 6
const COLS = 5

type CellState = 'correct' | 'present' | 'absent' | 'empty'

function evaluateGuess(guess: string, answer: string): CellState[] {
  const result: CellState[] = Array(COLS).fill('empty')
  const answerChars = answer.split('')
  const guessChars = guess.split('')

  // Mark exact matches
  for (let i = 0; i < COLS; i++) {
    if (guessChars[i] === answerChars[i]) {
      result[i] = 'correct'
      answerChars[i] = ''
      guessChars[i] = ''
    }
  }

  // Mark present (wrong position)
  for (let i = 0; i < COLS; i++) {
    if (guessChars[i] === '') continue
    const idx = answerChars.indexOf(guessChars[i])
    if (idx !== -1) {
      result[i] = 'present'
      answerChars[idx] = ''
    } else {
      result[i] = 'absent'
    }
  }

  return result
}

function getCellColor(state: CellState): string {
  switch (state) {
    case 'correct': return 'bg-green-500 text-white border-green-500'
    case 'present': return 'bg-yellow-500 text-white border-yellow-500'
    case 'absent': return 'bg-zinc-600 text-white border-zinc-600'
    default: return 'bg-transparent border-zinc-400 text-foreground'
  }
}

function selectWord(previous?: string): string {
  let word = WORDS[Math.floor(Math.random() * WORDS.length)]
  // Avoid repeating the same word consecutively
  while (previous && word === previous) {
    word = WORDS[Math.floor(Math.random() * WORDS.length)]
  }
  return word
}

export default function Wordle() {
  const [answer, setAnswer] = useState(() => selectWord())
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  // Build map of letter states for the keyboard
  const letterStates = useCallback(() => {
    const map = new Map<string, CellState>()
    for (const guess of guesses) {
      const states = evaluateGuess(guess, answer)
      for (let i = 0; i < COLS; i++) {
        const ch = guess[i]
        const prev = map.get(ch)
        if (states[i] === 'correct') map.set(ch, 'correct')
        else if (states[i] === 'present' && prev !== 'correct') map.set(ch, 'present')
        else if (states[i] === 'absent' && !prev) map.set(ch, 'absent')
      }
    }
    return map
  }, [guesses, answer])

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== COLS || gameOver) return
    const newGuesses = [...guesses, currentGuess.toLowerCase()]
    setGuesses(newGuesses)
    setCurrentGuess('')

  const isCorrect = currentGuess.toLowerCase() === answer
    if (isCorrect) {
      setWon(true)
      setGameOver(true)
    } else if (newGuesses.length >= ROWS) {
      setGameOver(true)
    }
  }, [currentGuess, guesses, answer, gameOver])

  // Auto-advance to the next word shortly after a game finishes
  useEffect(() => {
    if (!gameOver) return
    const timer = setTimeout(() => {
      setAnswer((prev) => selectWord(prev))
      setGuesses([])
      setCurrentGuess('')
      setGameOver(false)
      setWon(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [gameOver])

  // Physical keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameOver) return
      if (e.key === 'Backspace') {
        setCurrentGuess((p) => p.slice(0, -1))
      } else if (e.key === 'Enter') {
        submitGuess()
      } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < COLS) {
        setCurrentGuess((p) => (p + e.key).toLowerCase())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentGuess, gameOver, submitGuess])

  const lStates = letterStates()
  const keyboard = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ]

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Wordle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Grid */}
        <div className="grid grid-rows-6 gap-1">
          {Array.from({ length: ROWS }).map((_, row) => {
            const guess = guesses[row]
            const isCurrentRow = row === guesses.length && !gameOver
            const displayGuess = isCurrentRow
              ? currentGuess.padEnd(COLS, ' ')
              : (guess || '').padEnd(COLS, ' ')
            const states = guess ? evaluateGuess(guess, answer) : Array(COLS).fill('empty' as CellState)

            return (
              <div key={row} className="grid grid-cols-5 gap-1">
                {Array.from({ length: COLS }).map((_, col) => {
                  const ch = displayGuess[col]
                  const state = states[col]
                  const isActive = isCurrentRow && col === currentGuess.length - 1
                  return (
                    <div
                      key={col}
                      className={`aspect-square flex items-center justify-center rounded border-2 text-sm font-bold uppercase transition-colors ${getCellColor(state)} ${isActive ? 'ring-2 ring-primary' : ''}`}
                    >
                      {ch.trim()}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Status */}
        {gameOver && (
          <div className="text-center text-xs text-muted-foreground">
            <span>
              {won
                ? `Nice! Solved in ${guesses.length}/${ROWS}`
                : `The word was "${answer.toUpperCase()}"`}
            </span>
            <span className="ml-2 opacity-60">Next word soon...</span>
          </div>
        )}

        {/* On-screen keyboard */}
        <div className="space-y-0.5">
          {keyboard.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-0.5">
              {ri === 2 && <div className="w-4" />}
              {row.map((key) => {
                const st = lStates.get(key)
                const bg = st === 'correct'
                  ? 'bg-green-500 text-white'
                  : st === 'present'
                  ? 'bg-yellow-500 text-white'
                  : st === 'absent'
                  ? 'bg-secondary text-secondary-foreground opacity-40'
                  : 'bg-secondary text-secondary-foreground'
                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (!gameOver && currentGuess.length < COLS) {
                        setCurrentGuess((p) => p + key)
                      }
                    }}
                    className={`w-7 h-9 rounded text-xs font-bold uppercase transition-colors hover:opacity-80 ${bg}`}
                  >
                    {key}
                  </button>
                )
              })}
              {ri === 2 && (
                <button
                  onClick={() => {
                    if (!gameOver) setCurrentGuess((p) => p.slice(0, -1))
                  }}
                  className="w-10 h-9 rounded bg-secondary text-secondary-foreground text-[10px] font-bold hover:opacity-80 transition-opacity"
                >
                  Del
                </button>
              )}
            </div>
          ))}
          <div className="flex justify-center">
            <button
              onClick={submitGuess}
              disabled={gameOver || currentGuess.length < COLS}
              className="w-full h-9 rounded bg-primary text-primary-foreground text-xs font-bold hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              Enter
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
