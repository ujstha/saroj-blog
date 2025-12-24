-- Supabase Setup for AI Chat with Blog Knowledge
-- Run this SQL in your Supabase SQL Editor

-- 1. Enable pgvector extension for vector similarity search
create extension if not exists vector;

-- 2. Create table for blog embeddings
create table if not exists blog_embeddings (
  id uuid primary key default uuid_generate_v4(),
  blog_slug text not null,
  blog_title text not null,
  content_chunk text not null,
  embedding vector(384), -- HuggingFace all-MiniLM-L6-v2 embedding size
  metadata jsonb,
  created_at timestamptz default now()
);

-- 3. Create index for fast vector similarity search
create index if not exists blog_embeddings_embedding_idx 
on blog_embeddings using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- 4. Create similarity search function
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

-- 5. Enable Row Level Security (RLS) for public read access
alter table blog_embeddings enable row level security;

-- Allow anyone to read (for chat queries)
create policy "Allow public read access" 
on blog_embeddings for select 
using (true);

-- Only service role can insert/update/delete (for indexing)
create policy "Service role can insert" 
on blog_embeddings for insert 
with check (auth.role() = 'service_role');

create policy "Service role can update" 
on blog_embeddings for update 
using (auth.role() = 'service_role');

create policy "Service role can delete" 
on blog_embeddings for delete 
using (auth.role() = 'service_role');
