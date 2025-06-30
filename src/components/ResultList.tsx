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
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Sources</h2>
      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.sourceId}
            id={`source-${result.sourceId}`}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                {result.sourceId}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800 mb-1">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate block"
                  >
                    {result.title}
                  </a>
                </h3>
                <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                  {result.snippet}
                </p>
                <p className="text-green-600 text-xs truncate">
                  {new URL(result.url).hostname}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 