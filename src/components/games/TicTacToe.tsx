import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Circle, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Player = 'X' | 'O'
type Cell = Player | null

const LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

type Scores = { x: number; o: number; draws: number }

const SCORES_KEY = 'mi-tracker-ttt-scores'

function loadScores(): Scores {
  try {
    const raw = JSON.parse(localStorage.getItem(SCORES_KEY) || '{}')
    return { x: raw.x ?? 0, o: raw.o ?? 0, draws: raw.draws ?? 0 }
  } catch {
    return { x: 0, o: 0, draws: 0 }
  }
}

function PlayerIcon({ player, className }: { player: Player; className?: string }) {
  return player === 'X' ? (
    <X className={cn('text-orange-500', className)} strokeWidth={2.5} />
  ) : (
    <Circle className={cn('text-blue-500', className)} strokeWidth={2.5} />
  )
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [turn, setTurn] = useState<Player>('X')
  const [winLine, setWinLine] = useState<number[] | null>(null)
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)
  const [scores, setScores] = useState<Scores>(loadScores)

  useEffect(() => {
    try {
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores))
    } catch {}
  }, [scores])

  const newGame = useCallback(() => {
    setBoard(Array(9).fill(null))
    setTurn('X')
    setWinLine(null)
    setWinner(null)
  }, [])

  const play = (i: number) => {
    if (board[i] || winner) return
    const next = [...board]
    next[i] = turn
    setBoard(next)

    const line = LINES.find((l) => l.every((j) => next[j] === turn))
    if (line) {
      setWinLine(line)
      setWinner(turn)
      setScores((s) => ({ ...s, [turn === 'X' ? 'x' : 'o']: s[turn === 'X' ? 'x' : 'o'] + 1 }))
      return
    }
    if (next.every(Boolean)) {
      setWinner('draw')
      setScores((s) => ({ ...s, draws: s.draws + 1 }))
      return
    }
    setTurn((t) => (t === 'X' ? 'O' : 'X'))
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Tic Tac Toe</CardTitle>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="font-bold text-orange-500">X {scores.x}</span>
            <span className="font-bold text-blue-500">O {scores.o}</span>
            <span>{scores.draws} {scores.draws === 1 ? 'draw' : 'draws'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-xs font-medium">
          {winner === null ? (
            <>
              <PlayerIcon player={turn} className="h-3.5 w-3.5" />
              <span className="text-muted-foreground">turn</span>
            </>
          ) : winner === 'draw' ? (
            <span className="text-muted-foreground">It&rsquo;s a draw!</span>
          ) : (
            <>
              <PlayerIcon player={winner} className="h-3.5 w-3.5" />
              <span className="text-muted-foreground">wins!</span>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {board.map((c, i) => {
            const inWinLine = winLine?.includes(i) ?? false
            return (
              <button
                key={i}
                type="button"
                aria-label={`Cell ${i + 1}${c ? `: ${c}` : ', empty'}`}
                onClick={() => play(i)}
                disabled={!!c || !!winner}
                className={cn(
                  'aspect-square w-full rounded-lg border-2 flex items-center justify-center transition-all',
                  c === 'X' && 'text-orange-500 border-orange-500/50 bg-orange-500/10',
                  c === 'O' && 'text-blue-500 border-blue-500/50 bg-blue-500/10',
                  !c &&
                    'border-border text-transparent hover:bg-accent hover:border-primary/40 cursor-pointer disabled:cursor-default',
                  inWinLine && 'ring-2 ring-primary shadow-lg shadow-primary/20'
                )}
              >
                {c === 'X' && <X className="h-8 w-8" strokeWidth={2.5} />}
                {c === 'O' && <Circle className="h-8 w-8" strokeWidth={2.5} />}
              </button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5"
          onClick={newGame}
          title="Start a new game"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New Game
        </Button>
      </CardContent>
    </Card>
  )
}