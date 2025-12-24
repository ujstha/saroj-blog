# 🤖 AI Chatbot Setup Guide

## Overview

This chatbot uses **100% FREE services** to provide intelligent conversations about your blog content and social profiles:

- **Groq API** (Llama 3.1 70B) - FREE 14,400 requests/day
- **Supabase pgvector** - FREE 500MB storage
- **HuggingFace Embeddings** - FREE (rate-limited)

## Features

✅ RAG (Retrieval Augmented Generation) with blog content  
✅ Social media profile integration (LinkedIn, IMDB, GitHub, etc.)  
✅ Vector similarity search for relevant content  
✅ Streaming responses for better UX  
✅ Mobile-responsive chat widget  
✅ Dark/light theme support  

---

## Setup Steps

### 1. Sign Up for Free Services

#### Groq API (Required)
1. Go to https://console.groq.com/
2. Sign up with GitHub or email
3. Go to "API Keys" section
4. Create a new API key
5. Copy the key (starts with `gsk_`)

**Free Tier**: 14,400 requests/day (Llama 3.1 70B)

#### Supabase (Required)
1. Go to https://supabase.com/dashboard
2. Create a new project
3. Wait for project setup (2-3 minutes)
4. Go to "Project Settings" → "API"
5. Copy:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` secret key (`SUPABASE_SERVICE_ROLE_KEY`)

**Free Tier**: 500MB database storage, 2GB bandwidth/month

#### HuggingFace Token (Optional)
1. Go to https://huggingface.co/settings/tokens
2. Create a new token (read access)
3. Copy the token (starts with `hf_`)

**Note**: Without token, you get public API access with lower rate limits (still free)

---

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the chatbot-related variables:

```env
# Groq API
GROQ_API_KEY=gsk_your_actual_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# HuggingFace (optional)
HUGGINGFACE_TOKEN=hf_your_token_here
```

---

### 3. Set Up Supabase Database

#### Option A: Using Supabase Dashboard (Recommended)
1. Open your Supabase project
2. Go to "SQL Editor"
3. Click "New query"
4. Copy contents of `scripts/supabase-setup.sql`
5. Paste and click "Run"

#### Option B: Using CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

**What this does:**
- Enables `pgvector` extension
- Creates `blog_embeddings` table
- Creates similarity search function
- Sets up Row Level Security (RLS) policies

---

### 4. Index Your Blog Content

Run the indexing script to process all your blog posts:

```bash
node scripts/index-blog-content.js
```

**What this does:**
1. Fetches all blogs from Sanity
2. Converts Portable Text to plain text
3. Chunks text into ~500 character pieces
4. Generates embeddings using HuggingFace
5. Stores in Supabase for vector search

**Time estimate**: 
- ~1 minute per blog post (due to rate limiting)
- 20 blog posts = ~20 minutes

**Note**: The script automatically handles rate limiting with 1-second delays between requests.

---

### 5. Test the Chatbot

Start the development server:

```bash
npm run dev
```

Visit http://localhost:3000

You should see:
- Floating chat button (bottom-right corner)
- Click to open chat widget
- Try asking: "What does Saroj write about?"

---

## Usage Examples

### Questions the Bot Can Answer

**About Blog Content:**
- "What topics does Saroj write about?"
- "Show me posts about machine learning"
- "Tell me about his startup experience"

**About Social Profiles:**
- "Where can I find Saroj's work?"
- "What's his LinkedIn profile?"
- "Show me his GitHub projects"
- "Where can I see his films?"

**Mixed Queries:**
- "Does Saroj write about AI? Where can I learn more?"
- "What's his professional background?"

---

## Customization

### Update Social Links

Edit `src/constants/index.js`:

```javascript
export const socialMedias = [
  { title: "linkedin", href: "https://..." },
  // Add more...
]
```

The chatbot automatically includes all links in its knowledge base.

### Adjust Chat Behavior

Edit system prompt in `src/app/api/chat/route.js`:

```javascript
const systemPrompt = `You are Saroj's assistant...`
```

### Change UI Theme

Edit `src/components/chat/ChatWidget.jsx`:

```javascript
// Change colors, sizes, animations
className="bg-primary hover:scale-110..."
```

---

## Troubleshooting

### "HuggingFace API error: 503"
**Solution**: Model is loading. Wait 20 seconds and retry, or get HuggingFace token for priority access.

### "Supabase RPC error: function does not exist"
**Solution**: Run the SQL setup script in Supabase SQL Editor.

### "No relevant blog posts found"
**Solution**: Run indexing script: `node scripts/index-blog-content.js`

### Chat not appearing
**Solution**: 
1. Check browser console for errors
2. Verify all env variables are set
3. Restart dev server

### Rate limit errors
**Solution**:
1. Add `HUGGINGFACE_TOKEN` for higher limits
2. Indexing script auto-waits 60s when rate limited

---

## Re-indexing Content

When you publish new blog posts:

```bash
# Option 1: Re-index all content
node scripts/index-blog-content.js

# Option 2: Clear old data first (in Supabase SQL Editor)
DELETE FROM blog_embeddings;
```

Then run the indexing script.

---

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Important**: Run indexing script locally or set up a cron job to re-index periodically.

### Environment Variables in Vercel

Add all variables from `.env.local` to:
`Project Settings` → `Environment Variables`

---

## Cost Breakdown (All FREE!)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Groq API | 14.4K requests/day | $0 |
| Supabase | 500MB storage | $0 |
| HuggingFace | Rate-limited | $0 |
| Vercel | 100GB bandwidth | $0 |
| **TOTAL** | | **$0/month** |

---

## Monitoring Usage

### Groq Dashboard
https://console.groq.com/
- View API usage
- Track request counts
- Monitor rate limits

### Supabase Dashboard
https://supabase.com/dashboard
- Database size
- API requests
- Storage usage

---

## Upgrading to Paid Tiers (Optional)

If you exceed free limits:

### Groq Plus ($29/month)
- 1M requests/month
- Faster models

### Supabase Pro ($25/month)
- 8GB database
- 250GB bandwidth

**Note**: Free tier is sufficient for most personal blogs with <10K visitors/month.

---

## Architecture Diagram

```
User Question
     ↓
[ChatWidget.jsx]
     ↓
POST /api/chat/route.js
     ↓
1. Generate embedding (HuggingFace)
     ↓
2. Search similar content (Supabase pgvector)
     ↓
3. Build context with blog excerpts + social links
     ↓
4. Send to Groq API (Llama 3.1)
     ↓
5. Stream response back to user
```

---

## Support

For issues or questions:
1. Check this guide first
2. Review error messages in browser console
3. Check Groq/Supabase dashboards for API issues
4. Verify all environment variables are set correctly

---

## Next Steps

- [ ] Set up Groq API key
- [ ] Create Supabase project
- [ ] Run SQL setup script
- [ ] Configure environment variables
- [ ] Index blog content
- [ ] Test chatbot locally
- [ ] Deploy to production
- [ ] Monitor usage

Happy chatting! 🤖✨
