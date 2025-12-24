#!/usr/bin/env node

/**
 * Blog Content Indexing Script
 * 
 * This script:
 * 1. Fetches all blog posts from Sanity CMS
 * 2. Converts Portable Text to plain text
 * 3. Chunks text into manageable pieces
 * 4. Generates embeddings using HuggingFace API (FREE)
 * 5. Stores embeddings in Supabase for vector similarity search
 * 
 * Run: node scripts/index-blog-content.js
 */

import { toHTML } from '@portabletext/to-html'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Polyfill fetch for Node.js if needed
if (!globalThis.fetch) {
  globalThis.fetch = fetch
}

// Import Sanity client from your utils
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const SANITY_API_VERSION = '2024-12-24'

// Simple Sanity fetch function
async function fetchFromSanity(query) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Sanity API error: ${response.statusText}`)
  }
  
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
    
    // Strip HTML tags and clean up whitespace
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

// Chunk text into smaller pieces for better embeddings
function chunkText(text, maxLength = 500) {
  if (!text) return []
  
  // Split by sentences
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
  
  return chunks.filter(c => c.length > 50) // Filter out very short chunks
}

// Generate embedding using free HuggingFace API
async function generateEmbedding(text) {
  const HF_API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2'
  const HF_TOKEN = process.env.HUGGINGFACE_TOKEN
  
  const headers = {
    'Content-Type': 'application/json'
  }
  
  // Add auth token if available (increases rate limits)
  if (HF_TOKEN) {
    headers['Authorization'] = `Bearer ${HF_TOKEN}`
  }
  
  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inputs: text })
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HuggingFace API error: ${response.status} - ${error}`)
    }
    
    const embedding = await response.json()
    
    // HuggingFace returns array of arrays or single array
    return Array.isArray(embedding[0]) ? embedding[0] : embedding
  } catch (error) {
    console.error('Embedding generation error:', error)
    throw error
  }
}

// Main indexing function
async function indexBlogContent() {
  console.log('🚀 Starting blog content indexing...\n')
  
  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  }
  if (!SANITY_PROJECT_ID) {
    throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is required')
  }
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  // Fetch all blog posts from Sanity
  console.log('📚 Fetching blogs from Sanity...')
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
  console.log(`   Found ${blogs.length} blog posts\n`)
  
  let totalChunks = 0
  let successCount = 0
  let errorCount = 0
  
  // Process each blog
  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i]
    console.log(`\n[${i + 1}/${blogs.length}] 📝 Processing: ${blog.title}`)
    
    if (!blog.slug) {
      console.log('   ⚠️  Skipping (no slug)')
      continue
    }
    
    // Convert Portable Text to plain text (try both 'body' and 'content' fields)
    const portableText = blog.body || blog.content
    if (!portableText) {
      console.log('   ⚠️  Skipping (no content)')
      continue
    }
    
    const plainText = portableTextToPlain(portableText)
    if (!plainText || plainText.length < 100) {
      console.log('   ⚠️  Skipping (content too short)')
      continue
    }
    
    // Add short description to the beginning if available
    const fullText = blog.shortDescription 
      ? `${blog.shortDescription}\n\n${plainText}`
      : plainText
    
    // Chunk the text
    const chunks = chunkText(fullText, 500)
    console.log(`   ✂️  Split into ${chunks.length} chunks`)
    
    // Process each chunk
    for (let j = 0; j < chunks.length; j++) {
      const chunk = chunks[j]
      
      try {
        console.log(`   🔢 Generating embedding for chunk ${j + 1}/${chunks.length}...`)
        
        // Generate embedding
        const embedding = await generateEmbedding(chunk)
        
        // Store in Supabase
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
          errorCount++
        } else {
          console.log(`   ✅ Chunk ${j + 1} indexed successfully`)
          successCount++
        }
        
        totalChunks++
        
        // Rate limiting: wait 1 second between requests (HuggingFace free tier)
        if (j < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`   ❌ Error processing chunk ${j + 1}:`, error.message)
        errorCount++
        
        // If rate limited, wait longer
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          console.log('   ⏳ Rate limited, waiting 60 seconds...')
          await new Promise(resolve => setTimeout(resolve, 60000))
        }
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
  console.log(`   Errors: ${errorCount}`)
  console.log('='.repeat(60))
}

// Run the indexing
indexBlogContent().catch((error) => {
  console.error('\n❌ Indexing failed:', error)
  process.exit(1)
})
