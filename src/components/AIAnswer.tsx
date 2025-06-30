import DataVisualization from './DataVisualization';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  sourceId: number;
}

interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  description?: string;
  data: Array<{
    name: string;
    value: number;
    [key: string]: unknown;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
}

interface AIAnswerProps {
  answer: string;
  results: SearchResult[];
  visualizationData?: ChartData | null;
}

export default function AIAnswer({ answer, results, visualizationData }: AIAnswerProps) {
  if (!answer) return null;

  // Parse citations and make them clickable pills
  const parseCitations = (text: string) => {
    // Try multiple citation formats that OpenAI might use
    const citationRegexes = [
      /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g,  // **[text](url)**
      /\[([^\]]+)\]\(([^)]+)\)/g,          // [text](url)
      /\(\[([^\]]+)\]\(([^)]+)\)\)/g       // ([text](url))
    ];
    
    let bestMatch = null;
    
    // Find which regex matches
    for (const regex of citationRegexes) {
      const matches = [...text.matchAll(regex)];
      if (matches.length > 0) {
        bestMatch = matches;
        break;
      }
    }
    
    if (!bestMatch) {
      return [<span key="full-text">{text}</span>];
    }
    
    const parts = [];
    let lastIndex = 0;
    let citationIndex = 1;

    for (const match of bestMatch) {
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Find matching result by URL
      const citationUrl = match[2];
      const source = results.find(r => {
        try {
          const citationDomain = new URL(citationUrl).hostname;
          const sourceDomain = new URL(r.url).hostname;
          return citationDomain === sourceDomain;
        } catch {
          return citationUrl.includes(r.url) || r.url.includes(citationUrl);
        }
      });
      
      // Add citation pill
      parts.push(
        <button
          key={`citation-${citationIndex}`}
          onClick={() => {
            const element = document.getElementById(`source-${source?.sourceId || citationIndex}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('ring-2', 'ring-blue-400');
              setTimeout(() => {
                element.classList.remove('ring-2', 'ring-blue-400');
              }, 2000);
            }
          }}
          className="inline-flex items-center px-2.5 py-1 mx-1 text-xs font-semibold bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600/30 hover:text-blue-300 transition-all duration-200 cursor-pointer border border-blue-500/30 hover:border-blue-400/50 backdrop-blur-sm"
          title={source ? `Go to: ${source.title}` : `Go to: ${match[1]}`}
        >
          {citationIndex}
        </button>
      );
      
      lastIndex = match.index + match[0].length;
      citationIndex++;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : [<span key="full-text">{text}</span>];
  };



  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <div className="relative">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl blur-xl"></div>
        
        {/* Main content */}
        <div className="relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Answer</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-200 leading-relaxed text-base space-y-4">
              {parseCitations(answer)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Render visualization if present */}
      {visualizationData && (
        <DataVisualization chartData={visualizationData} />
      )}
    </div>
  );
} 