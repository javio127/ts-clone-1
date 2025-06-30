interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  sourceId: number;
}

interface AIAnswerProps {
  answer: string;
  results: SearchResult[];
}

export default function AIAnswer({ answer, results }: AIAnswerProps) {
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
          className="inline-flex items-center px-2 py-1 mx-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors cursor-pointer border border-blue-200"
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
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Answer</h2>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-800 leading-relaxed text-base">
            {parseCitations(answer)}
          </p>
        </div>
      </div>
    </div>
  );
} 