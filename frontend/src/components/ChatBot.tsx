import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Loader2, Trash2 } from 'lucide-react'
import { UserProfile } from '../lib/api'
import { useLang } from '../contexts/LangContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  user: UserProfile
}

const API = import.meta.env.VITE_API_URL as string

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={14} className="text-primary-600" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-primary-600 text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        }`}
      >
        {msg.content}
      </div>
    </div>
  )
}

export default function ChatBot({ user }: Props) {
  const { t, lang } = useLang()

  const makeWelcome = (): Message => ({
    role: 'assistant',
    content: t('chat.welcome'),
  })

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([makeWelcome()])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Reset welcome message when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [makeWelcome()]
      }
      return prev
    })
  }, [lang])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || streaming) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const history = messages.filter(m => m.content !== t('chat.welcome'))

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    const botMsg: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, botMsg])

    abortRef.current = new AbortController()

    try {
      const response = await fetch(`${API}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          message: trimmed,
          history: history.map(m => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok || !response.body) {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: t('chat.err1') },
        ])
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: t('chat.errPfx') + parsed.error },
              ])
              break
            }
            if (parsed.delta) {
              setMessages(prev => {
                const last = prev[prev.length - 1]
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: last.content + parsed.delta },
                ]
              })
            }
          } catch { /* malformed chunk */ }
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: t('chat.err2') },
        ])
      }
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    abortRef.current?.abort()
    setMessages([makeWelcome()])
    setStreaming(false)
    setInput('')
  }

  const lastBotEmpty = messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && streaming
  const SUGGESTIONS = [t('chat.s1'), t('chat.s2'), t('chat.s3')]

  return (
    <>
      {open && (
        <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] max-w-sm h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary-600 text-white shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm leading-none">Ментора</p>
              <p className="text-xs text-primary-200 mt-0.5">{t('chat.sub')}</p>
            </div>
            <button
              onClick={clearChat}
              title={t('chat.clear')}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {lastBotEmpty && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && !streaming && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors border border-primary-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-1 shrink-0 border-t border-gray-50">
            <div className="flex gap-2 items-end">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.ph')}
                disabled={streaming}
                className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent resize-none disabled:opacity-50 bg-gray-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || streaming}
                className="p-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl transition-all shrink-0"
              >
                {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open
            ? 'bg-gray-700 hover:bg-gray-800 scale-90'
            : 'bg-primary-600 hover:bg-primary-700 hover:scale-105'
        } ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        title={t('chat.open')}
      >
        <MessageCircle size={24} className="text-white" />
      </button>
    </>
  )
}
