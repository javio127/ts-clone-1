# Perplexity Clone - Hanover Takehome

A TypeScript-based clone of Perplexity AI that provides AI-powered answers with citations based on real-time search results.

## Features

- **OpenAI Web Search**: Real-time web search using OpenAI's built-in search tool
- **AI Responses**: Smart answers with automatic citation generation
- **Citation Pills**: Clean, clickable numbered citations that scroll to sources
- **Search History**: Persistent storage of searches in Supabase database
- **Modern UI**: Clean, responsive design with Star Wars theming
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **APIs**: OpenAI (web search + AI responses)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Ready for Vercel

## Prerequisites

- Node.js 18+ 
- OpenAI API key
- Supabase account (free tier available)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ts-clone-1
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
OPENAI_API_KEY=your-openai-api-key-here
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Get your API keys:**
- OpenAI: https://platform.openai.com/api-keys
- Supabase: https://app.supabase.com (create project → Settings → API)

### 3. Database Setup

Run the SQL commands in `schema.sql` in your Supabase SQL Editor to create the database tables.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **User Query**: Enter a question in the search box
2. **OpenAI Web Search**: OpenAI's built-in search tool finds relevant web sources
3. **AI Analysis**: AI generates a comprehensive answer with automatic citations
4. **Citation Pills**: Click numbered pills to scroll to the referenced sources
5. **Database Storage**: All searches are automatically saved to Supabase

## Architecture

```
[User Input] 
    ↓
[Next.js Frontend] 
    ↓ 
[/api/ask] (API Route)
    ↓
[OpenAI Responses API with Web Search]
    ↓
[AI Answer + Citations + Sources]
    ↓                    ↓
[Frontend Display]   [Supabase Storage]
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ask/route.ts           # Main API endpoint
│   │   └── recent-searches/route.ts # Recent searches API
│   ├── page.tsx                   # Main page component
│   └── layout.tsx                 # App layout
├── components/
│   ├── SearchBox.tsx              # Search input component
│   ├── ResultList.tsx             # Search results display
│   └── AIAnswer.tsx               # AI response with citation pills
├── lib/
│   └── supabase.ts                # Supabase client configuration
schema.sql                         # Database schema
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Build

```bash
npm run build
npm start
```

## Testing

Example queries to try:
- "What are the top VC firms in NYC?"
- "How many countries are there in the world?"
- "Latest developments in AI 2024"
- "What tech companies are valued over $10 billion?"

**Features to test:**
- Click numbered citation pills to scroll to sources
- Check Supabase dashboard to see saved searches
- Try on mobile for responsive design

## API Contract

### POST /api/ask

**Request:**
```json
{
  "query": "What are the top VC firms in NYC?"
}
```

**Response:**
```json
{
  "results": [
    {
      "title": "Insight Partners",
      "url": "https://en.wikipedia.org/wiki/Insight_Partners",
      "snippet": "Founded in 1995, Insight Partners is a global venture capital...",
      "sourceId": 1
    }
  ],
  "answer": "New York City is home to several prominent venture capital firms... ([en.wikipedia.org](url)) becomes numbered citation pills in the UI."
}
```

### GET /api/recent-searches

**Response:**
```json
{
  "searches": [
    {
      "id": "uuid",
      "query": "What are the top VC firms in NYC?",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## UI Features

- **Responsive Design**: Works perfectly on desktop and mobile
- **Loading States**: Animated loading indicators with Yoda wisdom
- **Error Handling**: User-friendly error messages
- **Citation Pills**: Clean numbered pills replace ugly bracketed links
- **Smooth Scrolling**: Click pills to smoothly scroll to referenced sources
- **Source Highlighting**: Sources briefly highlight when clicked
- **Star Wars Theme**: Stormtrooper logo and Yoda tagline
- **Fast Performance**: Optimized OpenAI search context for speed

## 🔒 Security & Performance

- **Environment Variables**: All API keys stored securely
- **Row Level Security**: Supabase RLS policies protect data
- **Non-blocking Database**: Searches saved asynchronously
- **Error Boundaries**: Graceful handling of API failures
- **Optimized Search**: Low context setting for faster responses

## 🎯 Key Improvements Over Standard Perplexity

- **Single API Integration**: Uses only OpenAI (no SerpAPI dependency)
- **Better Citations**: Clean numbered pills instead of bracketed links
- **Persistent History**: All searches saved to database
- **Custom Branding**: Star Wars theme with personality
- **Modern Stack**: Next.js 14 + TypeScript + Supabase

---

**Built with ❤️ for Hanover Takehome Interview**

*"Much to learn you still have" - Yoda*
