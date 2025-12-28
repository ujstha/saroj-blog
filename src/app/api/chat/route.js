import { socialMedias } from '@/constants'
import { PARTIAL_BLOGS_QUERY } from '@/constants/sanity-queries'
import { sanityFetch } from '@/utils/sanity'
import { createClient } from '@supabase/supabase-js'
import { OpenAIStream, StreamingTextResponse } from 'ai'
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
    
    // 2. Fetch ALL blog titles + summaries from Sanity (for complete blog knowledge)
    console.log('Fetching all blog content from Sanity...')
    const allBlogs = await sanityFetch({ query: PARTIAL_BLOGS_QUERY })
    
    // Build comprehensive blog catalog with summaries and categories
    const blogCatalog = allBlogs.map((b, idx) => {
      const categories = b.categories?.length ? ` [${b.categories.join(', ')}]` : ''
      const summary = b.shortDescription ? `\n  Summary: ${b.shortDescription}` : ''
      const date = b.publishedAt ? `\n  Published: ${new Date(b.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''
      return `${idx + 1}. **${b.title}**${categories}${summary}${date}\n  Link: /blogs/${b.slug}`
    }).join('\n\n')
    
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
    const blogContext = relevantBlogs?.length
      ? relevantBlogs.map((b, idx) => 
          `**Blog Post ${idx + 1}: ${b.blog_title}**\n${b.content_chunk}\n\n📖 Read more: [${b.blog_title}](/blogs/${b.blog_slug})`
        ).join('\n\n---\n\n')
      : 'No specific blog posts found for this query. Use your general knowledge about Saroj.'
    
    // 5. Build social media links context
    const socialLinks = socialMedias
      .map(social => `- ${social.title.charAt(0).toUpperCase() + social.title.slice(1)}: ${social.href}`)
      .join('\n')
    
    // 6. Create comprehensive system prompt
    const systemPrompt = `You are Saroj Bartaula's personal blog assistant. You help visitors learn about Saroj and find relevant information from his blog posts and social profiles.

**General Knowledge about Saroj & The Blog:**
- **Themes:** Saroj writes about Technology, Storytelling, Science, and Filmmaking.
- **Mission:** "Ideas in Motion" - driven by curiosity to explore the world and inspire others.
- **Background:** He lives in the Milky Way galaxy (playfully). He is a writer, filmmaker, and content creator.
- **Content:** He shares what he learns and creates to help others see the world differently.

**COMPLETE BLOG CATALOG (${allBlogs.length} posts with summaries):**
${blogCatalog}

**Available Context:**

**BLOG CONTENT (Specific detailed matches for current query):**
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
1. **Complete Knowledge:** You have the full catalog of all ${allBlogs.length} blog posts with their summaries above. Use this to answer questions about available content.
2. **Detailed Answers:** When users ask about specific topics, reference the relevant blog posts from the catalog and provide summaries.
3. **Find & Recommend:** If someone asks "what blogs do you have about X?", search the catalog by categories and summaries, then list matching posts.
4. **Summarize:** If asked to summarize a blog, use the summary from the catalog and invite them to read the full post.
5. **Smart Search:** Combine the complete catalog (for finding blogs) with the detailed content matches (for answering specific questions).
6. If asked about Saroj's work, filmography, or professional background, direct them to his IMDB or LinkedIn.
7. Always link to full blog posts using markdown: [Post Title](/blogs/slug)
8. Be helpful, friendly, and conversational.
9. If someone asks about contacting Saroj, mention the social media links above.

**Response Style:**
- Keep answers concise (2-4 sentences) unless more detail is needed
- Use markdown formatting for better readability
- Include relevant links to blog posts with context
- Use emojis sparingly but appropriately (📖 for blog links, 🎬 for film, 💼 for professional, 🔍 for search results)
- When listing multiple blogs, format as a numbered list with summaries
- Be conversational and engaging`

    // 7. Call Groq API (FREE - Llama 3.1 70B)
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
    
    // 8. Use OpenAIStream to handle the stream (Groq is OpenAI compatible)
    // This ensures the stream uses the correct Data Stream Protocol expected by useChat
    const stream = OpenAIStream(completion)
    
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
