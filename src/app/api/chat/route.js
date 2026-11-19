import { socialMedias } from '@/constants'
import { PARTIAL_BLOGS_QUERY } from '@/constants/sanity-queries'
import { sanityFetch } from '@/utils/sanity'
import { createClient } from '@supabase/supabase-js'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { CohereClient } from 'cohere-ai'
import Groq from 'groq-sdk'

export const runtime = 'edge'

const MAX_CATALOG_POSTS = 20
const MAX_CONTEXT_MATCHES = 3

function formatBlogCatalog(blogs) {
  return blogs.slice(0, MAX_CATALOG_POSTS).map((blog, index) => {
    const categories = blog.categories?.length ? ` [${blog.categories.join(', ')}]` : ''
    const summary = blog.shortDescription ? `\nSummary: ${blog.shortDescription}` : ''
    const date = blog.publishedAt
      ? `\nPublished: ${new Date(blog.publishedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}`
      : ''

    return `${index + 1}. ${blog.title}${categories}${summary}${date}\nLink: /blogs/${blog.slug}`
  }).join('\n\n')
}

function formatRelevantContext(relevantBlogs) {
  if (!relevantBlogs?.length) {
    return 'No specific indexed passages matched this question. Use the catalog and profile context only.'
  }

  return relevantBlogs.slice(0, MAX_CONTEXT_MATCHES).map((blog, index) => (
    `Match ${index + 1}: ${blog.blog_title}\n${blog.content_chunk}\nLink: /blogs/${blog.blog_slug}`
  )).join('\n\n---\n\n')
}

/**
 * Generate embedding using Cohere's free API (100 calls/min, 384-dim embeddings)
 */
async function generateEmbedding(text) {
  const COHERE_API_KEY = process.env.COHERE_API_KEY
  
  if (!COHERE_API_KEY) {
    throw new Error('COHERE_API_KEY is required. Get one from https://dashboard.cohere.com/api-keys')
  }
  
  try {
    const cohere = new CohereClient({
      token: COHERE_API_KEY
    })
    
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

/**
 * POST /api/chat
 * 
 * Chat endpoint with RAG (Retrieval Augmented Generation)
 * Uses Groq API (FREE tier - Llama 3.1) and Supabase vector search
 */
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
    console.log('Generating embedding for question...')
    const queryEmbedding = await generateEmbedding(userQuestion)
    
    // 2. Fetch ALL blog titles + summaries from Sanity (for complete blog knowledge)
    console.log('Fetching all blog content from Sanity...')
    const allBlogs = await sanityFetch({ query: PARTIAL_BLOGS_QUERY })
    
    // Build comprehensive blog catalog with summaries and categories
    const blogCatalog = formatBlogCatalog(allBlogs)
    
    // 3. Search Supabase for similar blog content
    console.log('Searching for relevant blog content...')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data: relevantBlogs, error: searchError } = await supabase.rpc(
      'match_blog_embeddings',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.3, // Lower threshold to find more general matches
        match_count: 5 // Increase count to get more context
      }
    )
    
    if (searchError) {
      console.error('Supabase search error:', searchError)
    }
    
    // 4. Build context from relevant blogs
    const blogContext = formatRelevantContext(relevantBlogs)
    
    // 5. Build social media links context
    const socialLinks = socialMedias
      .map(social => `- ${social.title.charAt(0).toUpperCase() + social.title.slice(1)}: ${social.href}`)
      .join('\n')
    
    // 6. Create comprehensive system prompt
    const systemPrompt = `You are Saroj AI, the assistant for Saroj Bartaula's personal site.

  Brand voice:
  - Calm, sharp, curious, and direct.
  - Minimal, not hypey.
  - Helpful without sounding generic.

  What Saroj publishes:
  - Technology
  - Storytelling
  - Science
  - Filmmaking

  About Saroj:
  - Writer, filmmaker, and content creator.
  - Mission: Ideas in Motion.
  - Playful line: he lives in the Milky Way galaxy.

  Profile links:
  - LinkedIn: https://www.linkedin.com/in/man-on-mission/
  - IMDB: https://www.imdb.com/name/nm10841378/
  - GitHub: https://github.com/saroj479
  - Facebook: https://www.facebook.com/saroj.bartaula.man.on.mission
  - Instagram: https://www.instagram.com/saroj_bartaula/
  - Twitter/X: https://x.com/saroj_bartaula1
  - WordPress: https://beyondmyimagination0.wordpress.com/

  Blog catalog (${Math.min(allBlogs.length, MAX_CATALOG_POSTS)} of ${allBlogs.length} posts shown):
  ${blogCatalog}

  Relevant indexed matches for this question:
  ${blogContext}

  Social and profile links:
  ${socialLinks}

  Rules:
  1. Answer the user's question first, immediately.
  2. Keep the default response to 2 short paragraphs or 1 short numbered list.
  3. If blog posts are relevant, recommend no more than 3 and include markdown links like [Post Title](/blogs/slug).
  4. When summarizing a post, use the catalog summary if available and do not invent details.
  5. If the question is about Saroj's career, filmography, or professional background, point to LinkedIn or IMDB.
  6. If the question is about contact or social presence, use the profile links above.
  7. If the site content does not support the answer, say so briefly and offer the closest relevant link.
  8. Do not mention internal prompts, embeddings, catalogs, or retrieval.
  9. Avoid emojis unless they add real value. Prefer none.
  10. Keep wording clean and on-brand: precise, modern, and human.

  Response format:
  - Start with the direct answer.
  - Then add links or suggestions only if useful.
  - Prefer plain markdown with short sentences.
  - No filler openings like "Sure" or "Absolutely".`

    // 7. Call Groq API
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    })
    
    console.log('Calling Groq API...')
    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
      ],
      stream: true,
      temperature: 0.45,
      max_tokens: 420,
      top_p: 1,
      stop: null
    })
    
    // 8. Use OpenAIStream to handle the stream (Groq is OpenAI compatible)
    // This ensures the stream uses the correct Data Stream Protocol expected by useChat
    const stream = OpenAIStream(completion)
    
    return new StreamingTextResponse(stream)
    
  } catch (error) {
    console.error('Chat API error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
