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
          'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300',
          'bg-white hover:scale-110 hover:shadow-xl',
          'flex items-center justify-center',
          'animate-bounce hover:animate-none',
          'border-2 border-primary/20'
        )}
        aria-label="Open chat"
      >
        <Image
          src="/assets/icons/sarojai.svg"
          alt="Saroj AI"
          width={48}
          height={48}
          className="w-10 h-10 object-contain"
          priority
        />
        
        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent1 text-xs flex items-center justify-center text-white font-semibold">
          AI
        </span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex flex-col',
        'w-full max-w-md rounded-lg border border-primary/20 bg-background shadow-2xl',
        'transition-all duration-300',
        isMinimized ? 'h-14' : 'h-[600px] md:h-[650px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-primary to-accent1 p-3 md:p-4 text-white">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white p-0.5 md:p-1 flex items-center justify-center overflow-hidden">
              <Image
                src="/assets/icons/sarojai.svg"
                alt="Saroj AI"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-green-400 border-2 border-white"></span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-xs md:text-sm truncate">Saroj&apos;s AI Assistant</h3>
            <p className="text-[10px] md:text-xs opacity-90">Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-full p-1.5 hover:bg-white/20 transition-colors"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMinimized ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 hover:bg-white/20 transition-colors"
            aria-label="Close chat"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto p-4 scroll-smooth">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'rounded-lg p-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300',
                  m.role === 'user'
                    ? 'ml-8 bg-primary/10 text-primary border border-primary/20'
                    : 'mr-8 bg-secondary/10 text-secondary border border-secondary/20'
                )}
              >
                <div
                  className="prose prose-sm max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }}
                />
              </div>
            ))}
            
            {isLoading && (
              <div className="mr-8 rounded-lg bg-secondary/10 p-3 text-sm text-secondary border border-secondary/20">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            {error && (
              <div className="mr-8 rounded-lg bg-red-100 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800">
                ⚠️ Error: {error.message}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} className="border-t border-primary/20 p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about blog posts, work, or social links..."
                className={cn(
                  'flex-1 rounded-lg border border-primary/20 bg-background px-4 py-2.5 text-sm',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'placeholder:text-secondary/50',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={cn(
                  'rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white',
                  'hover:bg-primary/90 transition-colors',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'flex items-center gap-2'
                )}
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden sm:inline">Thinking...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Quick suggestions */}
            {messages.length === 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  'What does Saroj write about?',
                  'Show me his latest posts',
                  'Where can I find his work?'
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleInputChange({ target: { value: suggestion } })
                    }}
                    className="rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary hover:bg-secondary/20 transition-colors border border-secondary/20"
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
