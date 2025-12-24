import { socialMedias } from '@/constants'
import { createClient } from '@supabase/supabase-js'
import { StreamingTextResponse } from 'ai'
import { CohereClient } from 'cohere-ai'
import Groq from 'groq-sdk'

export const runtime = 'edge'

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
    
    // 2. Search Supabase for similar blog content
    console.log('Searching for relevant blog content...')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data: relevantBlogs, error: searchError } = await supabase.rpc(
      'match_blog_embeddings',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.5, // Lower threshold for smaller embeddings
        match_count: 3
      }
    )
    
    if (searchError) {
      console.error('Supabase search error:', searchError)
    }
    
    // 3. Build context from relevant blogs
    const blogContext = relevantBlogs?.length
      ? relevantBlogs.map((b, idx) => 
          `**Blog Post ${idx + 1}: ${b.blog_title}**\n${b.content_chunk}\n\n📖 Read more: [${b.blog_title}](/blogs/${b.blog_slug})`
        ).join('\n\n---\n\n')
      : 'No specific blog posts found for this query.'
    
    // 4. Build social media links context
    const socialLinks = socialMedias
      .map(social => `- ${social.title.charAt(0).toUpperCase() + social.title.slice(1)}: ${social.href}`)
      .join('\n')
    
    // 5. Create comprehensive system prompt
    const systemPrompt = `You are Saroj Bartaula's personal blog assistant. You help visitors learn about Saroj and find relevant information from his blog posts and social profiles.

**Available Context:**

**BLOG CONTENT:**
${blogContext}

**SOCIAL MEDIA & PROFILES:**
${socialLinks}

**About Saroj:**
Saroj Bartaula is a writer, filmmaker, and content creator. You can learn more about him through:
- LinkedIn: https://www.linkedin.com/in/man-on-mission/ (Professional profile)
- IMDB: https://www.imdb.com/name/nm10841378/ (Filmography)
- GitHub: https://github.com/saroj479 (Code projects)
- Facebook: https://www.facebook.com/saroj.bartaula.man.on.mission
- Instagram: https://www.instagram.com/saroj_bartaula/
- Twitter/X: https://x.com/saroj_bartaula1
- WordPress: https://beyondmyimagination0.wordpress.com/

**Guidelines:**
1. Answer questions using the blog content provided above
2. If asked about Saroj's work, filmography, or professional background, direct them to his IMDB or LinkedIn
3. If asked about code projects, mention his GitHub profile
4. Always link to full blog posts using markdown: [Post Title](/blogs/slug)
5. If information isn't in the blogs or profiles, politely say "I don't have that specific information in Saroj's blog"
6. Be helpful, friendly, and concise
7. If someone asks about contacting Saroj, mention the social media links above
8. Format links as clickable markdown links

**Response Style:**
- Keep answers concise (2-4 sentences) unless more detail is needed
- Use markdown formatting for better readability
- Include relevant links to blog posts or social profiles
- Use emojis sparingly but appropriately (📖 for blog links, 🎬 for film, 💼 for professional)
- Be conversational and engaging`

    // 6. Call Groq API (FREE - Llama 3.1 70B)
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    })
    
    console.log('Calling Groq API...')
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Updated to current free tier model
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stop: null
    })
    
    // 7. Convert Groq stream to Vercel AI SDK format
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) {
              controller.enqueue(new TextEncoder().encode(text))
            }
          }
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })
    
    return new StreamingTextResponse(stream)
    
  } catch (error) {
    console.error('Chat API error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
