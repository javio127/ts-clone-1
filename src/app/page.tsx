'use client';

import { useState } from 'react';
import Image from 'next/image';
import SearchBox from '@/components/SearchBox';
import ResultList from '@/components/ResultList';
import AIAnswer from '@/components/AIAnswer';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  sourceId: number;
}

interface SearchResponse {
  results: SearchResult[];
  answer: string;
  visualizationData?: any;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setSearchData(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data: SearchResponse = await response.json();
      setSearchData(data);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20"></div>
              <Image 
                src="/logo.png" 
                alt="AI Search Assistant"
                width={120}
                height={120}
                className="relative w-24 h-24 md:w-30 md:h-30 rounded-full"
                priority
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">
              perplexity
            </h1>
          </div>
          <p className="text-gray-400 text-lg font-light tracking-wide">
            Where knowledge begins
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <SearchBox onSearch={handleSearch} isLoading={isLoading} />
          

        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-600 border-t-blue-500 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-lg animate-pulse"></div>
            </div>
            <p className="text-gray-400 font-light">Searching and analyzing results...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {searchData && !isLoading && (
          <div className="max-w-5xl mx-auto space-y-8">
            <AIAnswer 
              answer={searchData.answer} 
              results={searchData.results} 
              visualizationData={searchData.visualizationData}
            />
            <ResultList results={searchData.results} />
          </div>
        )}
      </div>
    </div>
  );
}
