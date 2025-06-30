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
    // Look for numbered citations like [1], [2], [3]
    const citationRegex = /\[(\d+)\]/g;
    const matches = [...text.matchAll(citationRegex)];
    
    if (matches.length === 0) {
      return [<span key="full-text">{text}</span>];
    }
    
    const parts = [];
    let lastIndex = 0;

    for (const match of matches) {
      // Add text before citation
      if (match.index && match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      const citationNum = parseInt(match[1]);
      const source = results.find(r => r.sourceId === citationNum);
      
      // Add citation pill
      parts.push(
        <button
          key={`citation-${citationNum}`}
          onClick={() => {
            const element = document.getElementById(`source-${citationNum}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('ring-2', 'ring-blue-400');
              setTimeout(() => {
                element.classList.remove('ring-2', 'ring-blue-400');
              }, 2000);
            }
          }}
          className="inline-flex items-center px-2.5 py-1 mx-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 hover:text-blue-800 transition-all duration-200 cursor-pointer border border-blue-300 hover:border-blue-400"
          title={source ? `Go to: ${source.title}` : `Source ${citationNum}`}
        >
          {citationNum}
        </button>
      );
      
      lastIndex = (match.index || 0) + match[0].length;
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
        {/* Subtle shadow effect */}
        <div className="absolute inset-0 bg-gray-100/50 rounded-2xl blur-xl"></div>
        
        {/* Main content */}
        <div className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Answer</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed text-base space-y-4">
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