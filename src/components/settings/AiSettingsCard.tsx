import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Key, Lock, LockOpen, RefreshCw, Save, Shield } from 'lucide-react'
import { PROVIDER_MODELS } from './settings-constants'
import { OtpDialog } from './OtpDialog'

interface AiSettingsCardProps {
  provider: string
  setProvider: (v: string) => void
  apiKey: string
  showApiKey: boolean
  setShowApiKey: (v: boolean) => void
  apiKeyValid: boolean | null
  model: string
  setModel: (v: string) => void
  customEndpoint: string
  setCustomEndpoint: (v: string) => void
  hasUnsavedAi: boolean
  savingAi: boolean
  aiSaved: boolean
  keyLocked: boolean
  lockMessage: string
  otpDialogOpen: boolean
  otpError: string
  otpExpired: boolean
  otpCode: string
  otpCountdown: number
  otpInput: string
  setOtpInput: (v: string) => void
  onApiKeyChange: (v: string) => void
  onApiKeyPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  onLockClick: () => void
  onSave: () => void
  onOtpSubmit: () => void
  onOtpResend: () => void
  openOtpDialog: () => void
  closeOtpDialog: () => void
}

export function AiSettingsCard({
  provider,
  setProvider,
  apiKey,
  showApiKey,
  setShowApiKey,
  apiKeyValid,
  model,
  setModel,
  customEndpoint,
  setCustomEndpoint,
  hasUnsavedAi,
  savingAi,
  aiSaved,
  keyLocked,
  lockMessage,
  otpDialogOpen,
  otpError,
  otpExpired,
  otpCode,
  otpCountdown,
  otpInput,
  setOtpInput,
  onApiKeyChange,
  onApiKeyPaste,
  onLockClick,
  onSave,
  onOtpSubmit,
  onOtpResend,
  openOtpDialog,
  closeOtpDialog,
}: AiSettingsCardProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Credits & AI Models
          </CardTitle>
          <CardDescription>Configure your AI provider, API key, and model preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
                <SelectItem value="custom">Custom LLM Endpoint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              API Key
            </Label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                onPaste={onApiKeyPaste}
                placeholder={`Enter your ${provider} API key`}
                className={keyLocked ? 'pr-20 opacity-60 cursor-not-allowed' : 'pr-20'}
                disabled={keyLocked}
              />
              {!keyLocked && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-9 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                  title={showApiKey ? 'Hide key' : 'Reveal key'}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              )}
              <Button
                type="button"
                variant={keyLocked ? 'default' : 'ghost'}
                size="sm"
                className={`absolute right-0 top-0 h-full px-3 ${keyLocked ? 'rounded-l-none' : ''}`}
                onClick={onLockClick}
                title={
                  keyLocked
                    ? 'Triple-click to unlock with your 7-digit one-time password'
                    : 'Lock API key'
                }
              >
                {keyLocked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
              </Button>
            </div>
            {lockMessage && keyLocked && (
              <p className="text-xs font-semibold flex items-center gap-1 text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                {lockMessage}
              </p>
            )}
            {lockMessage && !keyLocked && (
              <p className="text-xs font-semibold flex items-center gap-1 text-red-400">
                <AlertCircle className="h-3 w-3" />
                {lockMessage}
              </p>
            )}
            <div className="flex items-center gap-2">
              {apiKeyValid === true && (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Valid Key
                </Badge>
              )}
              {apiKeyValid === false && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Invalid Key
                </Badge>
              )}
              {apiKey.length === 0 && (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  API Not Provided
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            {provider === 'custom' ? (
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Enter custom model name"
              />
            ) : (
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {(PROVIDER_MODELS[provider] ?? []).map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {provider === 'custom' && (
            <div className="space-y-2">
              <Label>Custom Endpoint URL</Label>
              <Input
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://your-api-endpoint.com/v1"
              />
            </div>
          )}

          <div className="flex justify-end items-center gap-2">
            {aiSaved && (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </span>
            )}
            <Button onClick={onSave} disabled={!hasUnsavedAi || savingAi}>
              {savingAi ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {savingAi ? 'Saving...' : 'Save AI Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* One-Time Password dialog for unlocking the API key */}
      <OtpDialog
        open={otpDialogOpen}
        onOpenChange={(open) => (open ? openOtpDialog() : closeOtpDialog())}
        otpError={otpError}
        otpExpired={otpExpired}
        otpCode={otpCode}
        otpCountdown={otpCountdown}
        otpInput={otpInput}
        onOtpInput={setOtpInput}
        onSubmit={onOtpSubmit}
        onResend={onOtpResend}
      />
    </>
  )
}