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
    'percentage', 'statistics', 'data', 'revenue', 'sales', 'show me', 'list'
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

    

    // First, get web search results
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      tools: [{ 
        type: "web_search_preview",
        search_context_size: "low"
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
    let fullAnswer = textContent?.text || "I couldn't generate an answer based on the search results.";
    
    // Initialize visualization data as null
    let visualizationData = null;

    // Check if query needs visualization and use ONLY structured extraction
    if (queryNeedsVisualization(query)) {
      try {
        const structuredResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Extract REAL numerical data from the web search results for visualization. 
              CRITICAL: ONLY include data if you find actual numbers from the search results - NO estimates, approximations, or made-up data.
              
              If real numerical data is found:
              - Set chart_type to "bar" (for comparisons/rankings), "line" (for trends), or "pie" (for percentages)
              - Provide a descriptive title
              - Include the data source
              - Extract 3-15 real data points
              
              If NO real numerical data is found:
              - Set chart_type to "none"
              - Set title and data_source to empty strings
              - Set data_points to empty array`
            },
            {
              role: "user", 
              content: `Web search results: ${fullAnswer}\n\nQuery: ${query}\n\nExtract real numerical data for visualization if it exists.`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "visualization_extraction",
              strict: true,
                             schema: {
                 type: "object",
                 properties: {
                   chart_type: {
                     type: "string",
                     enum: ["bar", "line", "pie", "none"],
                     description: "Chart type or 'none' if no real data found"
                   },
                   title: {
                     type: "string",
                     description: "Chart title or empty string if no data"
                   },
                   data_source: {
                     type: "string", 
                     description: "Where data came from or empty string if no data"
                   },
                   data_points: {
                     type: "array",
                     items: {
                       type: "object",
                       properties: {
                         name: {
                           type: "string",
                           description: "Label for this data point"
                         },
                         value: {
                           type: "number",
                           description: "Actual numerical value from search results"
                         }
                       },
                       required: ["name", "value"],
                       additionalProperties: false
                     },
                     description: "Array of real data points, empty if no data found"
                   }
                 },
                 required: ["chart_type", "title", "data_source", "data_points"],
                 additionalProperties: false
               }
            }
          }
        });

                 const result = structuredResponse.choices[0]?.message?.content;
         if (result) {
           const structured = JSON.parse(result);
           if (structured.chart_type !== 'none' && structured.data_points && structured.data_points.length >= 3) {
             visualizationData = {
               type: structured.chart_type,
               title: structured.title,
               description: `Data visualization based on search results`,
               dataSource: structured.data_source,
               data: structured.data_points
             };
             console.log('🎯 TRUE Structured Output - Extracted real data:', structured.title);
           }
         }
      } catch (error) {
        console.log('Could not extract structured visualization data:', error);
      }
    }

    // Save search to database (don't await to avoid slowing response)
    supabase
      .from('searches')
      .insert({
        query,
        answer: fullAnswer,
      })
      .then(({ error }) => {
        if (error) console.log('DB save error:', error);
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