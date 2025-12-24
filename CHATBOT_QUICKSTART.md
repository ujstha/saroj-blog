# 🤖 AI Chatbot Implementation - Quick Start

## ✅ What Was Implemented

A **100% FREE** AI-powered chatbot that understands your blog content and social profiles:

### Core Features
- **RAG System**: Retrieves relevant blog content before answering
- **Social Integration**: Knows about LinkedIn, IMDB, GitHub, Instagram, Facebook, Twitter, WordPress
- **Streaming Responses**: Real-time AI responses using Groq (Llama 3.1 70B)
- **Vector Search**: Semantic similarity matching with Supabase pgvector
- **Responsive UI**: Beautiful chat widget with dark/light theme support

### Technology Stack (All Free!)
- **Groq API**: 14,400 requests/day (Llama 3.1 70B)
- **Supabase**: 500MB vector storage
- **HuggingFace**: Free embeddings API
- **Vercel AI SDK**: Streaming chat interface

## 🚀 Next Steps - Required Actions

### 1. Sign Up for Free Services (5 minutes)

**Groq (Required)**
- Visit: https://console.groq.com/
- Create account → Get API key
- Copy key (starts with `gsk_`)

**Supabase (Required)**
- Visit: https://supabase.com/dashboard
- Create new project
- Copy: URL, anon key, service_role key

**HuggingFace (Optional - improves rate limits)**
- Visit: https://huggingface.co/settings/tokens
- Create read token
- Copy key (starts with `hf_`)

### 2. Add Environment Variables

Create or update `.env.local`:

```env
# AI Chatbot
GROQ_API_KEY=gsk_your_key_here
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
HUGGINGFACE_TOKEN=hf_your_token_here  # Optional
```

### 3. Set Up Database (2 minutes)

1. Open Supabase project
2. Go to "SQL Editor"
3. Run the SQL from `scripts/supabase-setup.sql`
4. Click "Run" button

### 4. Index Your Blog Content (20 minutes)

Run this command to process all blog posts:

```bash
node scripts/index-blog-content.js
```

This will:
- Fetch all blogs from Sanity
- Generate embeddings
- Store in vector database

**Note**: Takes ~1 minute per blog post due to rate limiting

### 5. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 and click the chat button (bottom-right)

## 📁 Files Created

```
chat-bot-feature branch:
├── scripts/
│   ├── supabase-setup.sql          # Database schema
│   └── index-blog-content.js       # Indexing script
├── src/
│   ├── app/api/chat/
│   │   └── route.js                # Chat API endpoint
│   └── components/chat/
│       ├── ChatWidget.jsx          # Main UI component
│       └── index.js                # Exports
├── .env.example                    # Environment template
└── CHATBOT_SETUP.md               # Complete guide
```

## 🎯 Usage Examples

Once set up, users can ask:

**Blog Content:**
- "What does Saroj write about?"
- "Show me posts about AI"
- "Tell me about his startup experience"

**Social Profiles:**
- "Where can I find Saroj's films?"
- "What's his LinkedIn?"
- "Show me his GitHub projects"

**Mixed:**
- "Does he write about machine learning? Where can I learn more?"

## 📊 Cost: $0/month

| Service | Free Tier Limit |
|---------|----------------|
| Groq API | 14,400 requests/day |
| Supabase | 500MB storage |
| HuggingFace | Rate-limited (free) |
| Vercel | 100GB bandwidth |

Sufficient for blogs with <10K visitors/month

## 📖 Full Documentation

See `CHATBOT_SETUP.md` for:
- Detailed setup instructions
- Troubleshooting guide
- Customization options
- Production deployment
- Monitoring usage

## 🔄 Re-indexing

When you publish new blog posts:

```bash
node scripts/index-blog-content.js
```

Or set up a webhook/cron job for automatic indexing.

## 🐛 Common Issues

**Chat button not showing?**
- Check browser console for errors
- Verify all env variables are set
- Restart dev server

**No blog content in responses?**
- Run indexing script
- Check Supabase has data: `SELECT COUNT(*) FROM blog_embeddings;`

**Rate limit errors?**
- Add HuggingFace token
- Script auto-waits 60s when rate limited

## 🎉 What's Next?

1. Add your environment variables
2. Run Supabase SQL setup
3. Index your blog content
4. Test the chatbot
5. Deploy to production
6. Monitor usage in dashboards

---

**Branch**: `chat-bot-feature`  
**Ready to merge after**: Testing and adding env variables  
**Estimated setup time**: 30 minutes
