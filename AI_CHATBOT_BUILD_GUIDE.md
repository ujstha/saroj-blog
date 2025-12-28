# 🤖 Complete AI Chatbot Build Guide for Next.js Blog

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technologies Used](#technologies-used)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Code Breakdown](#code-breakdown)
6. [System Prompts & AI Configuration](#system-prompts--ai-configuration)
7. [How It Works](#how-it-works)
8. [Testing & Deployment](#testing--deployment)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This is a **100% FREE** AI-powered chatbot that:
- Understands your entire blog content (RAG - Retrieval Augmented Generation)
- Answers questions using Llama 3.3 70B (via Groq)
- Has complete knowledge of all blog posts with summaries
- Provides smart search and recommendations
- Streams responses in real-time
- Costs $0/month to run

**Key Features:**
- Complete blog catalog with titles, summaries, categories, and dates
- Vector similarity search for detailed content
- Social media links integration
- Real-time streaming responses
- Responsive mobile-first design
- Custom SVG icon branding

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User asks question                       │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              ChatWidget.jsx (UI Component)                   │
│  - Floating chat bubble                                      │
│  - Message display with streaming                            │
│  - Input handling                                            │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
        POST /api/chat/route.js
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  RAG Pipeline                                │
│                                                              │
│  1. Generate embedding (Cohere API)                         │
│     - Convert question to 384-dim vector                    │
│                                                              │
│  2. Fetch ALL blog catalog (Sanity CMS)                     │
│     - Titles, summaries, categories, dates                  │
│                                                              │
│  3. Vector search (Supabase pgvector)                       │
│     - Find similar blog content chunks                      │
│     - Threshold: 0.3 (lower = more results)                 │
│                                                              │
│  4. Build comprehensive context                             │
│     - Complete blog catalog                                 │
│     - Detailed vector matches                               │
│     - Social media links                                    │
│                                                              │
│  5. Send to LLM (Groq Llama 3.3 70B)                        │
│     - System prompt with full context                       │
│     - User conversation history                             │
│                                                              │
│  6. Stream response back to user                            │
│     - Real-time token streaming                             │
│     - Markdown formatting                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Technologies Used

| Component | Technology | Purpose | Cost |
|-----------|------------|---------|------|
| **LLM** | Groq (Llama 3.3 70B) | Generate answers | FREE (14,400 req/day) |
| **Embeddings** | Cohere | Convert text to vectors | FREE (100 calls/min) |
| **Vector DB** | Supabase pgvector | Store & search embeddings | FREE (500MB) |
| **CMS** | Sanity.io | Blog content source | FREE tier |
| **UI Framework** | Next.js 14 | React framework | FREE |
| **Streaming** | Vercel AI SDK | Real-time responses | FREE |

**Total monthly cost: $0** ✅

---

## Step-by-Step Implementation

### Phase 1: Setup Free Services

#### 1. Groq API Setup
```bash
# Visit: https://console.groq.com/
# 1. Sign up with GitHub/Google
# 2. Go to "API Keys"
# 3. Create new key
# 4. Copy key (starts with gsk_)
```

#### 2. Supabase Setup
```bash
# Visit: https://supabase.com/dashboard
# 1. Create new project
# 2. Wait 2-3 minutes for setup
# 3. Go to Project Settings → API
# 4. Copy:
#    - Project URL
#    - anon public key
#    - service_role secret key
```

#### 3. Cohere API Setup
```bash
# Visit: https://dashboard.cohere.com/api-keys
# 1. Sign up (free account)
# 2. Create API key
# 3. Copy key (starts with co_)
```

### Phase 2: Environment Variables

Create `.env.local`:
```env
# Groq API (LLM)
GROQ_API_KEY=gsk_your_key_here

# Supabase (Vector Database)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Cohere API (Embeddings)
COHERE_API_KEY=co_your_key_here

# Existing Sanity CMS (already configured)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

### Phase 3: Database Setup

**File: `scripts/supabase-setup.sql`**

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Create embeddings table
create table if not exists blog_embeddings (
  id uuid primary key default uuid_generate_v4(),
  blog_slug text not null,
  blog_title text not null,
  content_chunk text not null,
  embedding vector(384), -- Cohere embedding dimension
  metadata jsonb,
  created_at timestamptz default now()
);

-- Create index for fast similarity search
create index if not exists blog_embeddings_embedding_idx 
on blog_embeddings using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create similarity search function
create or replace function match_blog_embeddings (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  blog_slug text,
  blog_title text,
  content_chunk text,
  similarity float,
  metadata jsonb
)
language sql stable
as $$
  select
    blog_slug,
    blog_title,
    content_chunk,
    1 - (embedding <=> query_embedding) as similarity,
    metadata
  from blog_embeddings
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- Enable Row Level Security
alter table blog_embeddings enable row level security;

-- Allow public read access
create policy "Allow public read access" 
on blog_embeddings for select 
using (true);

-- Service role can insert/update/delete
create policy "Service role can insert" 
on blog_embeddings for insert 
with check (auth.role() = 'service_role');
```

**Run in Supabase SQL Editor:**
1. Open Supabase project
2. Go to SQL Editor
3. Paste above SQL
4. Click "Run"

### Phase 4: Install Dependencies

```bash
npm install @supabase/supabase-js cohere-ai groq-sdk ai
```

**Package versions:**
```json
{
  "@supabase/supabase-js": "^2.89.0",
  "cohere-ai": "^7.20.0",
  "groq-sdk": "^0.37.0",
  "ai": "^3.4.33"
}
```

### Phase 5: Indexing Script

**File: `scripts/index-blog-content.js`**

```javascript
#!/usr/bin/env node

import { toHTML } from '@portabletext/to-html'
import { createClient } from '@supabase/supabase-js'
import { CohereClient } from 'cohere-ai'
import fetch from 'node-fetch'

if (!globalThis.fetch) globalThis.fetch = fetch

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const SANITY_API_VERSION = '2024-12-24'

// Fetch blogs from Sanity
async function fetchFromSanity(query) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Sanity API error: ${response.statusText}`)
  const data = await response.json()
  return data.result
}

// Convert Portable Text to plain text
function portableTextToPlain(blocks) {
  if (!blocks || !Array.isArray(blocks)) return ''
  
  try {
    const html = toHTML(blocks, {
      components: {
        types: {
          image: () => '[Image]',
          code: ({ value }) => value?.code || ''
        },
        marks: {
          link: ({ children }) => children
        }
      }
    })
    
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\[Image\]/g, '')
      .trim()
  } catch (error) {
    console.error('Error converting Portable Text:', error)
    return blocks.map(b => b.children?.map(c => c.text).join(' ') || '').join(' ')
  }
}

// Chunk text into manageable pieces
function chunkText(text, maxLength = 500) {
  if (!text) return []
  
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunks = []
  let currentChunk = ''
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if ((currentChunk + trimmedSentence).length > maxLength && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = trimmedSentence
    } else {
      currentChunk += ' ' + trimmedSentence
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks.filter(c => c.length > 50)
}

// Generate embedding using Cohere
async function generateEmbedding(text) {
  const COHERE_API_KEY = process.env.COHERE_API_KEY
  
  if (!COHERE_API_KEY) {
    throw new Error('COHERE_API_KEY is required')
  }
  
  try {
    const cohere = new CohereClient({ token: COHERE_API_KEY })
    
    const response = await cohere.embed({
      texts: [text],
      model: 'embed-english-light-v3.0',
      inputType: 'search_document',
      embeddingTypes: ['float']
    })
    
    return response.embeddings.float[0]
  } catch (error) {
    console.error('Embedding generation failed:', error.message)
    throw error
  }
}

// Main indexing function
async function indexBlogContent() {
  console.log('🚀 Starting blog content indexing...\n')
  
  // Initialize Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  // Fetch all blogs
  const query = `*[_type == "blog"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    body,
    content,
    publishedAt,
    "categories": categories[]->title,
    shortDescription
  }`
  
  const blogs = await fetchFromSanity(query)
  console.log(`📚 Found ${blogs.length} blog posts\n`)
  
  let totalChunks = 0
  let successCount = 0
  
  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i]
    console.log(`\n[${i + 1}/${blogs.length}] 📝 Processing: ${blog.title}`)
    
    if (!blog.slug) continue
    
    const portableText = blog.body || blog.content
    if (!portableText) continue
    
    const plainText = portableTextToPlain(portableText)
    if (!plainText || plainText.length < 100) continue
    
    const fullText = blog.shortDescription 
      ? `${blog.shortDescription}\n\n${plainText}`
      : plainText
    
    const chunks = chunkText(fullText, 500)
    console.log(`   ✂️  Split into ${chunks.length} chunks`)
    
    for (let j = 0; j < chunks.length; j++) {
      const chunk = chunks[j]
      
      try {
        console.log(`   🔢 Generating embedding for chunk ${j + 1}/${chunks.length}...`)
        
        const embedding = await generateEmbedding(chunk)
        
        const { error } = await supabase
          .from('blog_embeddings')
          .insert({
            blog_slug: blog.slug,
            blog_title: blog.title,
            content_chunk: chunk,
            embedding: embedding,
            metadata: {
              publishedAt: blog.publishedAt,
              categories: blog.categories || [],
              chunkIndex: j,
              totalChunks: chunks.length,
              shortDescription: blog.shortDescription || null
            }
          })
        
        if (error) {
          console.error(`   ❌ Error inserting chunk ${j + 1}:`, error.message)
        } else {
          console.log(`   ✅ Chunk ${j + 1} indexed successfully`)
          successCount++
        }
        
        totalChunks++
        
        // Rate limiting: 1 second between requests
        if (j < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`   ❌ Error processing chunk ${j + 1}:`, error.message)
      }
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('🎉 Indexing complete!')
  console.log('='.repeat(60))
  console.log(`📊 Stats:`)
  console.log(`   Total blogs processed: ${blogs.length}`)
  console.log(`   Total chunks: ${totalChunks}`)
  console.log(`   Successfully indexed: ${successCount}`)
  console.log('='.repeat(60))
}

indexBlogContent().catch((error) => {
  console.error('\n❌ Indexing failed:', error)
  process.exit(1)
})
```

**Run the indexing:**
```bash
node scripts/index-blog-content.js
```

### Phase 6: Chat API Route

**File: `src/app/api/chat/route.js`**

```javascript
import { socialMedias } from '@/constants'
import { PARTIAL_BLOGS_QUERY } from '@/constants/sanity-queries'
import { sanityFetch } from '@/utils/sanity'
import { createClient } from '@supabase/supabase-js'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { CohereClient } from 'cohere-ai'
import Groq from 'groq-sdk'

export const runtime = 'edge'

// Generate embedding using Cohere
async function generateEmbedding(text) {
  const COHERE_API_KEY = process.env.COHERE_API_KEY
  
  if (!COHERE_API_KEY) {
    throw new Error('COHERE_API_KEY is required')
  }
  
  try {
    const cohere = new CohereClient({ token: COHERE_API_KEY })
    
    const response = await cohere.embed({
      texts: [text],
      model: 'embed-english-light-v3.0',
      inputType: 'search_query',
      embeddingTypes: ['float']
    })
    
    return response.embeddings.float[0]
  } catch (error) {
    console.error('Embedding generation failed:', error)
    throw error
  }
}

// Chat API endpoint
export async function POST(req) {
  try {
    const { messages } = await req.json()
    
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const userQuestion = messages[messages.length - 1].content
    
    // 1. Generate embedding for user's question
    const queryEmbedding = await generateEmbedding(userQuestion)
    
    // 2. Fetch ALL blog titles + summaries from Sanity
    const allBlogs = await sanityFetch({ query: PARTIAL_BLOGS_QUERY })
    
    // Build comprehensive blog catalog
    const blogCatalog = allBlogs.map((b, idx) => {
      const categories = b.categories?.length ? ` [${b.categories.join(', ')}]` : ''
      const summary = b.shortDescription ? `\n  Summary: ${b.shortDescription}` : ''
      const date = b.publishedAt 
        ? `\n  Published: ${new Date(b.publishedAt).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
          })}`
        : ''
      return `${idx + 1}. **${b.title}**${categories}${summary}${date}\n  Link: /blogs/${b.slug}`
    }).join('\n\n')
    
    // 3. Search Supabase for similar blog content
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data: relevantBlogs, error: searchError } = await supabase.rpc(
      'match_blog_embeddings',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 5
      }
    )
    
    if (searchError) {
      console.error('Supabase search error:', searchError)
    }
    
    // 4. Build context from relevant blogs
    const blogContext = relevantBlogs?.length
      ? relevantBlogs.map((b, idx) => 
          `**Blog Post ${idx + 1}: ${b.blog_title}**\n${b.content_chunk}\n\n📖 Read more: [${b.blog_title}](/blogs/${b.blog_slug})`
        ).join('\n\n---\n\n')
      : 'No specific blog posts found for this query.'
    
    // 5. Build social media links context
    const socialLinks = socialMedias
      .map(social => `- ${social.title.charAt(0).toUpperCase() + social.title.slice(1)}: ${social.href}`)
      .join('\n')
    
    // 6. Create comprehensive system prompt
    const systemPrompt = `You are Saroj Bartaula's personal blog assistant.

**General Knowledge:**
- Themes: Technology, Storytelling, Science, and Filmmaking
- Mission: "Ideas in Motion" - exploring and inspiring
- Background: Writer, filmmaker, and content creator

**COMPLETE BLOG CATALOG (${allBlogs.length} posts):**
${blogCatalog}

**DETAILED CONTENT (Vector search results):**
${blogContext}

**SOCIAL MEDIA:**
${socialLinks}

**Guidelines:**
1. You have complete knowledge of all ${allBlogs.length} blog posts
2. Use the catalog to find relevant blogs by topic
3. Use detailed content for specific answers
4. Always provide blog links in markdown format
5. Be helpful, concise, and conversational
6. Use emojis sparingly (📖 for blogs, 🔍 for search)

**Response Style:**
- Keep answers 2-4 sentences unless detail needed
- Format multiple blogs as numbered lists
- Include relevant links with context`

    // 7. Call Groq API
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stop: null
    })
    
    // 8. Stream response
    const stream = OpenAIStream(completion)
    return new StreamingTextResponse(stream)
    
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```

### Phase 7: Chat Widget UI

**File: `src/components/chat/ChatWidget.jsx`**

```javascript
'use client'

import { cn } from '@/utils/cn'
import { useChat } from 'ai/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '👋 Hi! I\'m Saroj\'s blog assistant. Ask me anything!'
      }
    ]
  })

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isMinimized])

  const onSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    handleSubmit(e)
  }

  // Format markdown to HTML
  const formatMessage = (content) => {
    try {
      let formatted = content
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />')
      
      formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        try {
          const href = url.trim()
          if (href && href.length > 0) {
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
      return content.replace(/\n/g, '<br />')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:scale-110 flex items-center justify-center text-white animate-bounce hover:animate-none"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent1 text-xs flex items-center justify-center text-white font-semibold">
          AI
        </span>
      </button>
    )
  }

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50 flex flex-col w-full max-w-md rounded-lg border bg-background shadow-2xl',
      isMinimized ? 'h-14' : 'h-[600px] md:h-[650px]'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-primary to-accent1 p-3 md:p-4 text-white">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white p-0.5 md:p-1 flex items-center justify-center">
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
          <div>
            <h3 className="font-semibold text-xs md:text-sm">Saroj's AI Assistant</h3>
            <p className="text-[10px] md:text-xs opacity-90">Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="rounded-full p-1.5 hover:bg-white/20">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMinimized ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
          <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 hover:bg-white/20">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'rounded-lg p-3 text-sm',
                  m.role === 'user'
                    ? 'ml-8 bg-primary/10 text-primary'
                    : 'mr-8 bg-secondary/10 text-secondary'
                )}
              >
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }}
                />
              </div>
            ))}
            
            {isLoading && (
              <div className="mr-8 rounded-lg bg-secondary/10 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} className="border-t p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about blog posts..."
                className="flex-1 rounded-lg border px-4 py-2.5 text-sm focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
              >
                {isLoading ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
```

**Export in `src/components/chat/index.js`:**
```javascript
export { ChatWidget } from './ChatWidget'
```

### Phase 8: Add to Layout

**File: `src/app/layout.js`**

```javascript
import { ChatWidget } from "@/components/chat"
// ... other imports

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Theme>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ChatWidget /> {/* Add this line */}
        </Theme>
      </body>
    </html>
  )
}
```

---

## Code Breakdown

### Key Components Explained

#### 1. **Embedding Generation** (Cohere)
```javascript
async function generateEmbedding(text) {
  const cohere = new CohereClient({ token: COHERE_API_KEY })
  
  const response = await cohere.embed({
    texts: [text],
    model: 'embed-english-light-v3.0', // 384 dimensions
    inputType: 'search_query',          // For queries
    embeddingTypes: ['float']
  })
  
  return response.embeddings.float[0] // Returns 384-dim array
}
```

**Why Cohere?**
- 100 calls/min free
- Fast embedding generation
- 384 dimensions (perfect for our use case)
- Better than HuggingFace (which deprecated their API)

#### 2. **Vector Similarity Search** (Supabase)
```javascript
const { data: relevantBlogs } = await supabase.rpc(
  'match_blog_embeddings',
  {
    query_embedding: queryEmbedding,  // User's question as vector
    match_threshold: 0.3,              // Cosine similarity threshold
    match_count: 5                     // Return top 5 matches
  }
)
```

**How it works:**
- Compares query vector with all blog vectors
- Uses cosine similarity (1 - distance)
- Threshold 0.3 = 30% similar or more
- Returns most similar chunks first

#### 3. **Blog Catalog Builder**
```javascript
const blogCatalog = allBlogs.map((b, idx) => {
  const categories = b.categories?.length ? ` [${b.categories.join(', ')}]` : ''
  const summary = b.shortDescription ? `\n  Summary: ${b.shortDescription}` : ''
  const date = b.publishedAt 
    ? `\n  Published: ${new Date(b.publishedAt).toLocaleDateString()}`
    : ''
  return `${idx + 1}. **${b.title}**${categories}${summary}${date}\n  Link: /blogs/${b.slug}`
}).join('\n\n')
```

**Output format:**
```
1. **The Future of AI** [Technology, Machine Learning]
   Summary: Exploring how AI will shape the next decade...
   Published: Dec 15, 2024
   Link: /blogs/future-of-ai

2. **My Filmmaking Journey** [Filmmaking, Storytelling]
   Summary: From first short to IMDB credits...
   Published: Nov 8, 2024
   Link: /blogs/filmmaker-journey
```

#### 4. **Streaming Response** (Groq + Vercel AI SDK)
```javascript
const completion = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    { role: 'system', content: systemPrompt },
    ...messages
  ],
  stream: true  // Enable streaming
})

const stream = OpenAIStream(completion)
return new StreamingTextResponse(stream)
```

**Why streaming?**
- Better UX (see response as it generates)
- Faster perceived performance
- Works with `useChat` hook from Vercel AI SDK

---

## System Prompts & AI Configuration

### Complete System Prompt Structure

```javascript
const systemPrompt = `You are Saroj Bartaula's personal blog assistant.

**General Knowledge:**
- Themes: Technology, Storytelling, Science, and Filmmaking
- Mission: "Ideas in Motion" - exploring and inspiring
- Background: Writer, filmmaker, and content creator

**COMPLETE BLOG CATALOG (${allBlogs.length} posts):**
${blogCatalog}

**DETAILED CONTENT (Vector search results):**
${blogContext}

**SOCIAL MEDIA:**
${socialLinks}

**Guidelines:**
1. You have complete knowledge of all ${allBlogs.length} blog posts
2. Use the catalog to find relevant blogs by topic
3. Use detailed content for specific answers
4. Always provide blog links in markdown format
5. Be helpful, concise, and conversational

**Response Style:**
- Keep answers 2-4 sentences unless detail needed
- Format multiple blogs as numbered lists
- Include relevant links with context`
```

### Why This Works

1. **Two-Layer Knowledge:**
   - **Catalog** = Breadth (all blogs overview)
   - **Vector Search** = Depth (specific content)

2. **Explicit Instructions:**
   - AI knows exactly what data it has
   - Clear formatting guidelines
   - Specific tone requirements

3. **Context-Aware:**
   - Knows total blog count
   - Has access to metadata (categories, dates)
   - Can reference social profiles

### LLM Parameters Explained

```javascript
{
  model: 'llama-3.3-70b-versatile',
  stream: true,
  temperature: 0.7,     // Creativity (0=factual, 1=creative)
  max_tokens: 1024,     // Max response length
  top_p: 1,            // Nucleus sampling
  stop: null           // No special stop sequences
}
```

**Temperature: 0.7**
- Not too creative (avoid hallucinations)
- Not too robotic (natural conversation)
- Sweet spot for chatbot

---

## How It Works

### Complete Flow Diagram

```
User: "What blogs do you have about AI?"
         ↓
┌────────────────────────────────────────┐
│ 1. Generate Embedding (Cohere)        │
│    Input: "What blogs do you have..." │
│    Output: [0.123, -0.456, ...] (384) │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│ 2. Fetch All Blogs (Sanity)           │
│    Query: PARTIAL_BLOGS_QUERY          │
│    Returns: [                          │
│      { title, slug, summary, cats },   │
│      ...                               │
│    ]                                   │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│ 3. Vector Search (Supabase)           │
│    Function: match_blog_embeddings     │
│    Compare: query vec vs all blog vecs │
│    Threshold: 0.3                      │
│    Returns: Top 5 similar chunks       │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│ 4. Build Context                       │
│    Combine:                            │
│    - Full catalog (20 blogs)           │
│    - Detailed matches (5 chunks)       │
│    - Social links                      │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│ 5. Send to LLM (Groq)                 │
│    System: Full context + guidelines   │
│    User: Original question             │
│    Model: Llama 3.3 70B                │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│ 6. Stream Response                     │
│    Token by token back to UI           │
│    Format: Markdown → HTML             │
└────────────────────────────────────────┘
```

### Example Response Generation

**User:** "What do you write about?"

**AI receives this context:**
```
COMPLETE BLOG CATALOG (20 posts):
1. **AI Ethics in 2024** [Technology, AI]
   Summary: Exploring moral implications...
   Link: /blogs/ai-ethics-2024
2. **Storytelling in Film** [Filmmaking]
   Summary: Techniques from Nolan...
   Link: /blogs/storytelling-film
...

DETAILED CONTENT:
**Blog Post 1: AI Ethics in 2024**
In this post, I explore the ethical challenges facing AI developers...
📖 Read more: [AI Ethics in 2024](/blogs/ai-ethics-2024)
```

**AI generates:**
```
I write about four main themes:

1. 📱 **Technology & AI** - Including posts like [AI Ethics in 2024](/blogs/ai-ethics-2024)
2. 🎬 **Filmmaking** - Like [Storytelling in Film](/blogs/storytelling-film)
3. 🔬 **Science** - Exploring curiosity-driven topics
4. ✍️ **Storytelling** - Narrative techniques and creativity

Check out all 20 posts to dive deeper! 📖
```

---

## Testing & Deployment

### Local Testing

```bash
# 1. Start dev server
npm run dev

# 2. Open http://localhost:3000

# 3. Test queries:
- "What blogs do you have?"
- "Tell me about AI"
- "Show me your latest posts"
- "Where can I find your films?"
```

### Build & Deploy

```bash
# 1. Build for production
npm run build

# 2. Test production build
npm start

# 3. Deploy to Vercel
vercel deploy --prod

# Or push to GitHub (auto-deploy if connected)
git push origin main
```

### Environment Variables in Production

Add these in Vercel dashboard:
- `GROQ_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `COHERE_API_KEY`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`

---

## Troubleshooting

### Common Issues

#### 1. "COHERE_API_KEY is required"
**Solution:**
```bash
# Check .env.local exists
cat .env.local

# Ensure key starts with "co_"
COHERE_API_KEY=co_your_key_here

# Restart dev server
npm run dev
```

#### 2. No blog content in responses
**Solution:**
```bash
# Run indexing script
node scripts/index-blog-content.js

# Check Supabase has data
# In Supabase SQL Editor:
SELECT COUNT(*) FROM blog_embeddings;
```

#### 3. Chat widget not appearing
**Solution:**
```javascript
// Check src/app/layout.js imports ChatWidget
import { ChatWidget } from "@/components/chat"

// Check it's added to JSX
<ChatWidget />

// Clear cache and restart
rm -rf .next
npm run dev
```

#### 4. Streaming errors
**Solution:**
```javascript
// Ensure Edge Runtime
export const runtime = 'edge'

// Check OpenAIStream is used
const stream = OpenAIStream(completion)
return new StreamingTextResponse(stream)
```

#### 5. Supabase RPC error
**Solution:**
```sql
-- Re-run setup SQL in Supabase SQL Editor
-- Check function exists:
SELECT * FROM pg_proc WHERE proname = 'match_blog_embeddings';
```

---

## Performance Optimization

### Tips for Faster Responses

1. **Lower match_count:**
```javascript
match_count: 3  // Instead of 5
```

2. **Cache blog catalog:**
```javascript
// In route.js
let cachedBlogs = null
let cacheTime = null

const allBlogs = cachedBlogs && (Date.now() - cacheTime < 60000)
  ? cachedBlogs
  : await sanityFetch({ query: PARTIAL_BLOGS_QUERY })
```

3. **Reduce chunk size:**
```javascript
// In indexing script
chunkText(fullText, 300)  // Instead of 500
```

---

## Cost Monitoring

### Free Tier Limits

| Service | Limit | Usage Tracking |
|---------|-------|----------------|
| Groq | 14,400 req/day | https://console.groq.com/ |
| Cohere | 100 calls/min | https://dashboard.cohere.com/ |
| Supabase | 500MB storage | Project dashboard |

### Monitoring Script

```bash
# Check Supabase storage
psql "postgresql://..." -c "
SELECT 
  COUNT(*) as total_embeddings,
  pg_size_pretty(pg_total_relation_size('blog_embeddings')) as size
FROM blog_embeddings;
"
```

---

## Next Steps & Extensions

### Future Enhancements

1. **Add conversation memory:**
```javascript
// Store chat history in localStorage
const { messages, setMessages } = useChat({
  initialMessages: loadFromStorage() || defaultMessages
})
```

2. **Add source citations:**
```javascript
// In system prompt
"Always cite which blog post you're referencing"
```

3. **Add analytics:**
```javascript
// Track popular questions
await supabase.from('chat_analytics').insert({
  question: userQuestion,
  timestamp: new Date()
})
```

4. **Multi-language support:**
```javascript
// Detect language and translate
const language = detectLanguage(userQuestion)
const translatedResponse = await translate(response, language)
```

---

## Summary

You now have:
- ✅ Complete RAG chatbot implementation
- ✅ Free forever (no recurring costs)
- ✅ Full blog knowledge with summaries
- ✅ Real-time streaming responses
- ✅ Responsive mobile design
- ✅ Vector similarity search
- ✅ Custom branding (SVG icon)

**Total build time:** ~2-3 hours  
**Monthly cost:** $0  
**Requests/day:** 14,400 (Groq limit)

---

## Quick Reference

### Key Files
```
src/app/api/chat/route.js      # Main API logic
src/components/chat/ChatWidget.jsx  # UI component
scripts/index-blog-content.js  # Indexing script
scripts/supabase-setup.sql     # Database setup
```

### Key Commands
```bash
# Index blogs
node scripts/index-blog-content.js

# Start dev
npm run dev

# Build
npm run build

# Deploy
vercel deploy --prod
```

### API Keys Needed
- Groq API Key (gsk_...)
- Cohere API Key (co_...)
- Supabase URL & Keys
- Sanity Project ID (already configured)

---

**Built with ❤️ using 100% free services**
