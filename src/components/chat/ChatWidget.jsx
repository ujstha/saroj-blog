'use client'

import { headingFont } from '@/app/fonts'
import { cn } from '@/utils/cn'
import { useChat } from 'ai/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const WELCOME_MESSAGE = "Hi! I'm Saroj's blog assistant. Ask me anything about his blog posts, work, or social profiles."

const QUICK_SUGGESTIONS = [
  'What does Saroj write about?',
  'Show me latest posts',
  'Find his work',
  'How can I contact him?'
]

function decodeCommonEntities(value) {
  return value
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

/**
 * ChatWidget Component
 * 
 * A floating chat widget that appears on all pages
 * Uses Groq API + Supabase vector search for RAG
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)

  const { messages, input, handleInputChange, handleSubmit, append, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 ${WELCOME_MESSAGE}`
      }
    ],
    onError: (error) => {
      console.error('Chat error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    },
    onFinish: (message) => {
      console.log('Message completed:', message)
    }
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isMinimized])

  // Handle form submission
  const onSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    handleSubmit(e)
  }

  const handleQuickSuggestion = async (suggestion) => {
    if (isLoading) return

    await append({
      role: 'user',
      content: suggestion
    })
  }

  // Convert markdown links to HTML — sanitize to prevent XSS
  const formatMessage = (content) => {
    try {
      const normalizedContent = decodeCommonEntities(content)

      // First, escape HTML entities to prevent XSS injection
      let formatted = normalizedContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

      // Now safe to process markdown
      // Bold text
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Line breaks
      formatted = formatted.replace(/\n/g, '<br />')
      
      // Handle markdown links — only allow safe URLs
      formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        try {
          const href = url.trim()
          // Only allow http(s) and relative URLs — block javascript: etc
          if (href && (href.startsWith('http') || href.startsWith('/'))) {
            const isExternal = href.startsWith('http')
            return `<a href="${href}" class="text-accent1 hover:underline font-medium" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`
          }
        } catch (err) {
          console.warn('Link formatting error:', err)
        }
        return match
      })
      
      return formatted
    } catch (error) {
      console.error('Format error:', error)
      return content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 overflow-hidden rounded-full border border-white/40 transition-all duration-300 md:bottom-6 md:right-6',
          'flex items-center gap-2 bg-background/85 p-1.5 pr-3 shadow-[0_20px_60px_rgba(6,14,24,0.18)] backdrop-blur-xl',
          'hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(6,14,24,0.22)]'
        )}
        aria-label="Open chat"
      >
        <span className="ring-accent1/20 relative flex size-11 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(var(--accent-color-1-rgb),0.4),rgba(var(--background-color-rgb),0.85))] ring-1 md:size-12">
          <Image
            src="/assets/icons/sarojai.svg"
            alt="Saroj AI"
            width={48}
            height={48}
            className="size-8 object-contain md:size-9"
          />
          <span className="absolute right-0 top-0 size-2.5 rounded-full bg-accent1 shadow-[0_0_16px_rgba(var(--accent-color-1-rgb),0.75)]" />
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className={cn('block truncate text-sm font-semibold tracking-[0.18em] text-primary/90', headingFont.className)}>
            Saroj AI
          </span>
          <span className="text-secondary/70 block text-[11px] uppercase tracking-[0.24em]">
            Ask the archive
          </span>
        </span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col overflow-hidden',
        'bottom-0 left-0 right-0 mx-2 mb-2 md:bottom-6 md:left-auto md:right-6 md:mx-0 md:mb-0',
        'w-auto rounded-[28px] border border-white/40 bg-background/80 shadow-[0_24px_100px_rgba(7,15,25,0.22)] backdrop-blur-2xl md:w-full md:max-w-[430px]',
        'transition-all duration-300',
        isMinimized ? 'h-20' : 'h-[calc(100vh-7rem)] md:h-[680px]'
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--accent-color-1-rgb),0.16),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(var(--primary-text-color-rgb),0.08),transparent_30%)]" />

      {/* Header */}
      <div className="border-primary/10 relative flex items-start justify-between border-b bg-[linear-gradient(135deg,rgba(var(--background-color-rgb),0.92),rgba(var(--accent-color-1-rgb),0.1))] p-4 text-primary md:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative shrink-0">
            <div className="bg-background/90 flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-white/50 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] md:size-12">
              <Image
                src="/assets/icons/sarojai.svg"
                alt="Saroj AI"
                width={40}
                height={40}
                className="size-full object-contain"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-background bg-accent1 shadow-[0_0_18px_rgba(var(--accent-color-1-rgb),0.7)]"></span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-secondary/60 mb-1 text-[10px] uppercase tracking-[0.35em]">Knowledge Console</p>
            <h3 className={cn('truncate text-lg font-semibold tracking-[0.08em] md:text-xl', headingFont.className)}>
              {"Saroj's AI Assistant"}
            </h3>
            <p className="text-secondary/80 mt-1 max-w-72 text-[11px] leading-relaxed md:text-xs">
              Search posts, projects, and public profiles in one place.
            </p>
          </div>
        </div>

        <div className="ml-3 flex items-center gap-1.5 md:gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="border-primary/10 bg-background/70 rounded-full border p-2 text-secondary transition-colors hover:bg-background hover:text-primary md:p-2.5"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            <svg className="size-4 md:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMinimized ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="border-primary/10 bg-background/70 rounded-full border p-2 text-secondary transition-colors hover:bg-background hover:text-primary md:p-2.5"
            aria-label="Close chat"
          >
            <svg className="size-4 md:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="border-primary/10 bg-background/45 relative border-b px-4 py-3 md:px-5">
            <div className="text-secondary/65 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.24em] md:text-[11px]">
              <span className="border-primary/10 bg-background/80 rounded-full border px-2.5 py-1">Live context</span>
              <span className="border-primary/10 bg-background/80 rounded-full border px-2.5 py-1">Blog + social</span>
              <span className="border-primary/10 bg-background/80 rounded-full border px-2.5 py-1">Fast answers</span>
            </div>
          </div>

          <div className="relative flex-1 space-y-3 overflow-y-auto scroll-smooth p-4 md:space-y-4 md:p-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'animate-in fade-in slide-in-from-bottom-2 rounded-3xl border p-3 text-xs duration-300 md:p-4 md:text-sm',
                  m.role === 'user'
                    ? 'ml-10 border-transparent bg-[linear-gradient(135deg,rgba(var(--primary-text-color-rgb),0.94),rgba(var(--accent-color-1-rgb),0.86))] text-white shadow-[0_18px_36px_rgba(10,18,28,0.18)] md:ml-16'
                    : 'mr-10 border-primary/10 bg-background/90 text-primary shadow-[0_12px_28px_rgba(10,18,28,0.06)] md:mr-16'
                )}
              >
                <div className={cn(
                  'mb-2 text-[10px] font-semibold uppercase tracking-[0.28em]',
                  m.role === 'user' ? 'text-white/70' : 'text-accent1/80'
                )}>
                  {m.role === 'user' ? 'You' : 'Saroj AI'}
                </div>
                <div
                  className={cn(
                    'prose prose-sm max-w-none leading-relaxed [&_a]:break-words [&_strong]:font-semibold',
                    m.role === 'user'
                      ? '[&_a]:text-white [&_a]:underline [&_strong]:text-white'
                      : '[&_a]:text-accent1 [&_strong]:text-primary'
                  )}
                  dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }}
                />
              </div>
            ))}
            
            {isLoading && (
              <div className="border-primary/10 bg-background/90 mr-10 rounded-3xl border p-3 text-xs text-secondary shadow-[0_12px_28px_rgba(10,18,28,0.06)] md:mr-16 md:p-4 md:text-sm">
                <div className="text-accent1/80 mb-2 text-[10px] font-semibold uppercase tracking-[0.28em]">Saroj AI</div>
                <div className="flex items-center gap-2">
                  <div className="size-2 animate-bounce rounded-full bg-accent1" style={{ animationDelay: '0ms' }} />
                  <div className="size-2 animate-bounce rounded-full bg-accent1" style={{ animationDelay: '150ms' }} />
                  <div className="size-2 animate-bounce rounded-full bg-accent1" style={{ animationDelay: '300ms' }} />
                  <span className="text-secondary/70 ml-1 text-[11px]">Thinking through the archive...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mr-10 rounded-3xl border border-red-300/60 bg-red-100/80 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 md:mr-16 md:p-4 md:text-sm">
                ⚠️ Error: {error.message}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} className="border-primary/10 bg-background/75 shrink-0 border-t px-4 pb-4 pt-3 backdrop-blur-xl md:px-5 md:pb-5 md:pt-4">
            {messages.length === 1 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      handleQuickSuggestion(suggestion)
                    }}
                    disabled={isLoading}
                    className="border-primary/10 bg-background/90 hover:border-accent1/30 rounded-full border px-3 py-1.5 text-[11px] font-medium text-secondary transition-all hover:-translate-y-0.5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 md:text-xs"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div className="border-primary/10 bg-background/95 flex gap-2 rounded-[22px] border p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about posts, work, or profiles..."
                className={cn(
                  'flex-1 bg-transparent px-3 py-2 text-sm text-primary md:px-4 md:py-3',
                  'placeholder:text-secondary/50',
                  'focus:outline-none',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-2xl bg-[linear-gradient(135deg,rgba(var(--primary-text-color-rgb),0.95),rgba(var(--accent-color-1-rgb),0.85))] px-4 py-2 text-xs font-medium text-white md:gap-2 md:px-5 md:py-3 md:text-sm',
                  'transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(10,18,28,0.18)]',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {isLoading ? (
                  <>
                    <svg className="size-3.5 animate-spin md:size-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden md:inline">Thinking...</span>
                  </>
                ) : (
                  <>
                    <svg className="size-3.5 md:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span className="hidden md:inline">Send</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-secondary/65 mt-3 px-1 text-[11px] leading-relaxed">
              Answers are grounded in the blog catalog, indexed post content, and public profile links.
            </p>
          </form>
        </>
      )}
    </div>
  )
}
