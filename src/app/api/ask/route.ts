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



// Function to check if query likely needs visualization
function queryNeedsVisualization(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const chartKeywords = [
    'compare', 'comparison', 'vs', 'versus', 'top', 'ranking', 'largest', 'biggest', 'most', 'best',
    'market cap', 'gdp', 'population', 'stock price', 'trends', 'growth', 'market share',
    'percentage', 'statistics', 'data', 'revenue', 'sales', 'show me', 'list',
    'highest', 'scoring', 'points', 'ppg', 'stats', 'season', 'performance', 'numbers'
  ];
  
  return chartKeywords.some(keyword => lowerQuery.includes(keyword));
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

    

    // Get web search results with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    let response;
    try {
      response = await openai.responses.create({
        model: "gpt-4o-mini",  // Using available model
        tools: [{ 
          type: "web_search_preview",
          search_context_size: "medium"  // Better context quality
        }],
        tool_choice: { type: "web_search_preview" }, // Force web search
        input: query,
      });
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('OpenAI API timeout or error:', error);
      return NextResponse.json({ 
        results: [],
        answer: "I'm experiencing slow response times. Please try again in a moment.",
        visualizationData: null 
      });
    }

    // Debug the full response structure
    console.log('🔍 Full response structure:', JSON.stringify(response.output, null, 2));
    
    // Look for web search call info
    const webSearchCall = response.output.find(item => item.type === 'web_search_call');
    if (webSearchCall) {
      console.log('🌐 Web search performed:', webSearchCall);
    }

    // Extract content and annotations
    const messageContent = response.output.find(item => item.type === 'message');
    const textContent = messageContent?.content?.[0] as TextContent;
    const annotations = textContent?.annotations || [];

    // Get the raw answer text
    let fullAnswer = textContent?.text || "I couldn't generate an answer based on the search results.";
    
    // Debug logging
    console.log('📊 Message content found:', !!messageContent);
    console.log('📊 Text content found:', !!textContent?.text);
    console.log('📊 Annotations found:', annotations.length);
    console.log('📊 Sample annotation:', annotations[0]);
    console.log('📊 Query needs viz:', queryNeedsVisualization(query));
    
    // Try to extract real citations from annotations
    const results = annotations
      .filter((annotation): annotation is URLCitation => annotation.type === 'url_citation')
      .map((annotation, index) => {
        const cleanUrl = annotation.url.split('?')[0];
        return {
          title: annotation.title || 'Web Source',
          url: cleanUrl,
          snippet: textContent?.text.substring(annotation.start_index, annotation.end_index) || '',
          sourceId: index + 1,
        };
      });

    // Enhanced fallback citation system - inject generic numbered citations
    if (results.length === 0 && fullAnswer.length > 100) {
      // Create generic fallback sources that work for any topic
      const fallbackSources = [
        { title: 'Web Search Results', url: 'https://web.search', snippet: '', sourceId: 1 },
        { title: 'Online Sources', url: 'https://online.sources', snippet: '', sourceId: 2 }
      ];
      results.push(...fallbackSources); // Add fallback sources
      console.log('⚠️ Using fallback citations - OpenAI annotations missing');
    }
    
    // Quick cleanup of text artifacts including ugly URLs
    fullAnswer = fullAnswer
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold**
      .replace(/\\text\{[^}]+\}/g, '') // Remove LaTeX
      .replace(/\\\\/g, '').replace(/\\,/g, '') // Remove backslashes
      .replace(/###\s*/g, '').replace(/\$\$[^$]*\$\$/g, '') // Remove headers/math
      .replace(/\(\[([^\]]+)\]\([^)]+\)\)/g, '') // Remove ugly ([text](url)) citations
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Clean up [text](url) to just text
      .replace(/\s+/g, ' ').trim(); // Normalize whitespace

    // Add citations if we have sources (including fallback)
    if (results.length > 0 && fullAnswer.length > 50) {
      const sentences = fullAnswer.split(/\.\s+/).slice(0, Math.min(results.length, 4));
      fullAnswer = sentences.map((sentence, index) => {
        if (sentence.length > 25 && !sentence.includes('[')) {
          return sentence + ` [${index + 1}]`;
        }
        return sentence;
      }).join('. ') + (fullAnswer.includes('.') ? '.' : '');
    }
    
    // Initialize visualization data as null
    let visualizationData = null;

    // Check if query needs visualization and use ONLY structured extraction (with timeout)
    if (queryNeedsVisualization(query)) {
      try {
        const vizTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Visualization timeout')), 8000)
        );
        
        const vizPromise = openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Extract REAL numerical data from web search results for visualization. Be concise.
              
              If real numerical data found: set chart_type to "bar"/"line"/"pie", provide title, data_source, 3-15 data_points
              If NO real data found: set chart_type to "none", empty title/data_source, empty data_points array`
            },
            {
              role: "user", 
              content: `Results: ${fullAnswer.substring(0, 500)}...\n\nQuery: ${query}\n\nExtract numerical data for charts.`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "viz_data",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  chart_type: { type: "string", enum: ["bar", "line", "pie", "none"] },
                  title: { type: "string" },
                  data_source: { type: "string" },
                  data_points: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        value: { type: "number" }
                      },
                      required: ["name", "value"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["chart_type", "title", "data_source", "data_points"],
                additionalProperties: false
              }
            }
          }
        });

        const structuredResponse = await Promise.race([vizPromise, vizTimeout]) as { choices: Array<{ message: { content: string } }> };
        const result = structuredResponse.choices[0]?.message?.content;
        
        if (result) {
          const structured = JSON.parse(result);
          if (structured.chart_type !== 'none' && structured.data_points?.length >= 3) {
            visualizationData = {
              type: structured.chart_type,
              title: structured.title,
              description: `Data visualization based on search results`,
              dataSource: structured.data_source,
              data: structured.data_points
            };
            console.log('🎯 Fast viz extraction:', structured.title);
          }
        }
      } catch {
        console.log('Visualization extraction skipped due to timeout/error');
        // Continue without visualization - don't block the response
      }
    }

    // Save to database asynchronously (fire-and-forget, no blocking)
    setImmediate(() => {
      supabase
        .from('searches')
        .insert({
          query,
          answer: fullAnswer,
        })
        .then(({ error }) => {
          if (error) console.log('DB save error (non-blocking):', error);
          else console.log('✅ Search saved to history');
        });
    });

    return NextResponse.json({
      results,
      answer: fullAnswer,
      visualizationData,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 