interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  sourceId: number;
}

interface ResultListProps {
  results: SearchResult[];
}

export default function ResultList({ results }: ResultListProps) {
  if (results.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white">Sources</h2>
      </div>
      
      <div className="grid gap-4">
        {results.map((result) => (
          <div
            key={result.sourceId}
            id={`source-${result.sourceId}`}
            className="relative group"
          >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Main content */}
            <div className="relative bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-200">
              <div className="flex items-start space-x-4">
                <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
                  {result.sourceId}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-blue-400 hover:text-blue-300 mb-2 transition-colors">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {result.title}
                    </a>
                  </h3>
                  <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                    {result.snippet}
                  </p>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    <p className="text-green-400 text-xs font-medium">
                      {new URL(result.url).hostname}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 