'use client'

import { cn } from '@/utils/cn'
import { useChat } from 'ai/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

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
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '👋 Hi! I&apos;m Saroj&apos;s blog assistant. Ask me anything about his blog posts, work, or social profiles!'
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

  // Convert markdown links to HTML with better error handling
  const formatMessage = (content) => {
    try {
      let formatted = content
        // Bold text
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Line breaks first
        .replace(/\n/g, '<br />')
      
      // Handle links more carefully - only process complete markdown links
      // This regex checks for complete [text](url) patterns
      formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        try {
          const href = url.trim()
          // Only process if we have a valid URL
          if (href && href.length > 0) {
            const isExternal = href.startsWith('http')
            return `<a href="${href}" class="text-accent1 hover:underline font-medium" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`
          }
        } catch (err) {
          console.warn('Link formatting error:', err)
        }
        // Return original if parsing fails
        return match
      })
      
      return formatted
    } catch (error) {
      console.error('Format error:', error)
      // Fallback to plain text with line breaks only
      return content.replace(/\n/g, '<br />')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 size-12 rounded-full shadow-lg transition-all duration-300 md:bottom-6 md:right-6 md:size-14',
          'flex items-center justify-center bg-white',
          'animate-bounce hover:scale-110 hover:animate-none hover:shadow-xl',
          'border-2 border-primary/20'
        )}
        aria-label="Open chat"
      >
        <Image
          src="/assets/icons/sarojai.svg"
          alt="Saroj AI"
          width={48}
          height={48}
          className="size-8 object-contain md:size-10"
          priority
        />
        
        {/* Notification badge */}
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent1 text-[10px] font-semibold text-white md:size-5 md:text-xs">
          AI
        </span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col',
        // Mobile: full width with small margins, Desktop: fixed width at bottom-right
        'bottom-0 left-0 right-0 mx-2 mb-2 md:bottom-6 md:left-auto md:right-6 md:mx-0 md:mb-0',
        'w-auto rounded-lg border border-primary/20 bg-background shadow-2xl md:w-full md:max-w-md',
        'transition-all duration-300',
        // Mobile: vh-based height, Desktop: fixed height
        isMinimized ? 'h-14' : 'h-[calc(100vh-8rem)] md:h-[600px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-primary to-accent1 p-2.5 text-white md:p-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative shrink-0">
            <div className="flex size-7 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 md:size-9 md:p-1">
              <Image
                src="/assets/icons/sarojai.svg"
                alt="Saroj AI"
                width={40}
                height={40}
                className="size-full object-contain"
                priority
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-white bg-green-400 md:size-2.5"></span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xs font-semibold md:text-sm">Saroj&apos;s AI Assistant</h3>
            <p className="text-[9px] opacity-90 md:text-[10px]">Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-full p-1 transition-colors hover:bg-white/20 md:p-1.5"
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
            className="rounded-full p-1 transition-colors hover:bg-white/20 md:p-1.5"
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
          <div className="flex-1 space-y-3 overflow-y-auto scroll-smooth p-3 md:space-y-4 md:p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'animate-in fade-in slide-in-from-bottom-2 rounded-lg p-2.5 text-xs duration-300 md:p-3 md:text-sm',
                  m.role === 'user'
                    ? 'ml-6 border border-primary/20 bg-primary/10 text-primary md:ml-8'
                    : 'mr-6 border border-secondary/20 bg-secondary/10 text-secondary md:mr-8'
                )}
              >
                <div
                  className="prose prose-sm max-w-none leading-relaxed [&_a]:break-words"
                  dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }}
                />
              </div>
            ))}
            
            {isLoading && (
              <div className="border-secondary/20 bg-secondary/10 mr-6 rounded-lg border p-2.5 text-xs text-secondary md:mr-8 md:p-3 md:text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
                  <div className="size-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
                  <div className="size-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            {error && (
              <div className="mr-6 rounded-lg border border-red-300 bg-red-100 p-2.5 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 md:mr-8 md:p-3 md:text-sm">
                ⚠️ Error: {error.message}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} className="border-primary/20 shrink-0 border-t p-3 md:p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything..."
                className={cn(
                  'flex-1 rounded-lg border border-primary/20 bg-background px-3 py-2 text-xs md:px-4 md:py-2.5 md:text-sm',
                  'placeholder:text-secondary/50',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white md:gap-2 md:px-4 md:py-2.5 md:text-sm',
                  'transition-colors hover:bg-primary/90',
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
            
            {/* Quick suggestions */}
            {messages.length === 1 && (
              <div className="mt-2 flex flex-wrap gap-1.5 md:mt-3 md:gap-2">
                {[
                  'What does Saroj write about?',
                  'Show me latest posts',
                  'Find his work'
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleInputChange({ target: { value: suggestion } })
                    }}
                    className="border-secondary/20 bg-secondary/10 hover:bg-secondary/20 rounded-full border px-2.5 py-1 text-[10px] text-secondary transition-colors md:px-3 md:text-xs"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </form>
        </>
      )}
    </div>
  )
}
