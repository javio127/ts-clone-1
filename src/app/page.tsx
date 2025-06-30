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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex flex-col items-center mb-4">
            <Image 
              src="/logo.png" 
              alt="Perplexity Clone Logo"
              width={160}
              height={160}
              className="w-32 h-32 md:w-40 md:h-40 mb-4"
              priority
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-2 sr-only">
              Perplexity Clone
            </h1>
          </div>
          <p className="text-gray-600 text-lg italic">
            Much to learn, you still have!
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-8">
          <SearchBox onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching and analyzing results...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {searchData && !isLoading && (
          <div className="space-y-8">
            <AIAnswer answer={searchData.answer} results={searchData.results} />
            <ResultList results={searchData.results} />
          </div>
        )}
      </div>
    </div>
  );
}
