import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

interface URLCitation {
  type: 'url_citation';
  start_index: number;
  end_index: number;
  url: string;
  title?: string;
}

interface TextContent {
  type: 'output_text';
  text: string;
  annotations?: URLCitation[];
}

export async function POST(request: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Use OpenAI's web search tool with faster settings
    const response = await openai.responses.create({
      model: "gpt-4o-mini", // Already using the fastest model
      tools: [{ 
        type: "web_search_preview",
        search_context_size: "low" // Faster response, lower cost
      }],
      input: query,
    });

    // Extract citations from annotations
    const messageContent = response.output.find(item => item.type === 'message');
    const textContent = messageContent?.content?.[0] as TextContent;
    const annotations = textContent?.annotations || [];

    // Format results from citations
    const results = annotations
      .filter((annotation): annotation is URLCitation => annotation.type === 'url_citation')
      .map((annotation, index) => {
        // Clean up URL by removing UTM parameters and other tracking
        const cleanUrl = annotation.url.split('?')[0];
        
        return {
          title: annotation.title || 'Web Source',
          url: cleanUrl,
          snippet: textContent?.text.substring(annotation.start_index, annotation.end_index) || '',
          sourceId: index + 1,
        };
      });

    // Get the answer text
    const answer = textContent?.text || "I couldn't generate an answer based on the search results.";

    // Save search to database (don't await to avoid slowing response)
    supabase
      .from('searches')
      .insert({
        query,
        answer,
      })
      .then(({ error }) => {
        if (error) console.log('DB save error:', error);
      });

    return NextResponse.json({
      results,
      answer,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 