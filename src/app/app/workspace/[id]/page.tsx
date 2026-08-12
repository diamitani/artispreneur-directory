"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

interface Message {
  id: string
  role: "user" | "agent"
  content: string
  intent?: string
  domain?: string
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "agent",
  content:
    "Hey! I'm your Artispreneur AI assistant. I can help you find music industry contacts, write outreach pitches, plan releases, and research the market.\n\nWhat genre do you work in? That'll help me give you the most relevant recommendations.",
}

const SUGGESTIONS = [
  "Find hip-hop blogs in LA accepting submissions",
  "Write a pitch email for an indie rock playlist",
  "Plan a release strategy for my first EP",
  "Research venues in Austin for a tour",
]

function MessageBubble({ msg }: { msg: Message }) {
  return (
    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={
          msg.role === "user"
            ? "chat-bubble-user px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap"
            : "chat-bubble-agent px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap"
        }
      >
        {msg.role === "agent" && msg.intent && (
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/15 text-[10px] font-semibold uppercase tracking-wider text-[#22d3ee]">
              {msg.intent}
            </span>
            {msg.domain && (
              <span className="text-[11px] text-white/30">{msg.domain}</span>
            )}
          </div>
        )}
        <div
          dangerouslySetInnerHTML={{
            __html: msg.content
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\n\n/g, "</p><p>")
              .replace(/\n• /g, "<br/>• ")
              .replace(/\n/g, "<br/>")
              .replace(/^/, "<p>")
              .replace(/$/, "</p>")
              .replace(/<p><\/p>/g, ""),
          }}
        />
      </div>
    </div>
  )
}

export default function WorkspaceChatPage() {
  const params = useParams()
  const workspaceId = (params.id as string) || "default"
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  async function sendMessage() {
    const text = input.trim()
    if (!text || sending) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setSending(true)

    try {
      const token = localStorage.getItem("token")
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role === "agent" ? "assistant" : "user",
          content: m.content,
        }))

      const res = await fetch(`${BACKEND}/api/v1/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt: text,
          session_id: workspaceId,
          history: history.slice(-10),
        }),
      })

      const data = await res.json()
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: data.message || "Sorry, I couldn't process that.",
        intent: data.intent,
        domain: data.domain,
      }
      setMessages((prev) => [...prev, agentMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "agent",
          content: "Sorry, I hit a snag. Can you try again?",
        },
      ])
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/15 flex items-center justify-center text-sm">
          💬
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-[#f7f8f8]">AI Assistant</h2>
          <p className="text-[12px] text-white/30">
            {workspaceId === "default" ? "General workspace" : workspaceId}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Suggestions (shown when only welcome message exists) */}
        {messages.length === 1 && (
          <div className="mt-6 space-y-2">
            <p className="text-[12px] text-white/30 mb-3">Try asking:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s)
                  setTimeout(() => inputRef.current?.focus(), 100)
                }}
                className="block w-full text-left px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[14px] text-white/50 hover:text-white/80 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {sending && (
          <div className="flex justify-start">
            <div className="chat-bubble-agent px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#22d3ee]/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-[#22d3ee]/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-[#22d3ee]/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-6 py-4 border-t border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about contacts, pitches, releases..."
            rows={1}
            className="agent-input min-h-[44px] max-h-[120px]"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="shrink-0 w-10 h-10 rounded-xl bg-[#22d3ee] disabled:bg-white/[0.06] disabled:cursor-not-allowed flex items-center justify-center transition-all hover:bg-[#67e8f9] active:scale-95 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#050505" : "#555"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
        <p className="mt-2 text-[11px] text-white/25 text-center">
          Artispreneur AI • Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
