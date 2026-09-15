import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react'

interface OtpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  otpError: string
  otpExpired: boolean
  otpCode: string
  otpCountdown: number
  otpInput: string
  onOtpInput: (v: string) => void
  onSubmit: () => void
  onResend: () => void
}

export function OtpDialog({
  open,
  onOpenChange,
  otpError,
  otpExpired,
  otpCode,
  otpCountdown,
  otpInput,
  onOtpInput,
  onSubmit,
  onResend,
}: OtpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Unlock API Key
          </DialogTitle>
          <DialogDescription>
            Enter the 7-digit one-time password shown below to unlock and edit the API key.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {otpError && (
            <p
              className={`text-xs font-medium flex items-center gap-1.5 rounded-md border px-3 py-2 ${
                otpError.includes('generated')
                  ? 'border-green-500/40 bg-green-500/10 text-green-400'
                  : 'border-red-500/40 bg-red-500/10 text-red-400'
              }`}
            >
              {otpError.includes('generated') ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              {otpError}
            </p>
          )}

          <div className="space-y-3">
            <Label htmlFor="otp-input">One-Time Password (7 digits)</Label>

            {/* Freshly generated, single-use code */}
            <div className="rounded-md border bg-muted/40 p-3 text-center">
              {otpExpired ? (
                <p className="text-xs text-red-400">
                  This code has expired. Generate a new one below.
                </p>
              ) : (
                <p className="text-3xl font-mono font-bold tracking-[0.3em] text-primary">
                  {otpCode || '•••••••'}
                </p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">
                Valid for {otpCountdown}s • single use only
              </p>
            </div>

            <Input
              id="otp-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={7}
              placeholder="•••••••"
              disabled={otpExpired}
              value={otpInput}
              onChange={(e) => onOtpInput(e.target.value.replace(/\D/g, '').slice(0, 7))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmit()
              }}
            />

            <div className="flex justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={onResend}>
                Generate new
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={onSubmit} disabled={otpExpired}>
                  Unlock
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The code changes every time you unlock, so a used code can never be reused.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}