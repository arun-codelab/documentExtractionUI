import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import ResultsDisplay from './components/ResultsDisplay';
import SummaryDisplay from './components/SummaryDisplay';
import { uploadDocuments, summarizeDocuments } from './services/api';
import { clsx } from 'clsx';
import { DocumentMagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

function App() {
  const [activeTab, setActiveTab] = useState('extract');
  const [extractionResults, setExtractionResults] = useState([]);
  const [summaryResults, setSummaryResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExtractionUpload = async (formData) => {
    setIsLoading(true);
    setError(null);
    setExtractionResults([]);
    try {
      const response = await uploadDocuments(formData);
      setExtractionResults(response.results || []);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during extraction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizationUpload = async (formData) => {
    setIsLoading(true);
    setError(null);
    setSummaryResults([]);
    try {
      const response = await summarizeDocuments(formData);
      setSummaryResults(response.results || []);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during summarization.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <DocumentMagnifyingGlassIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">DocProcess AI</h1>
          </div>
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('extract')}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'extract'
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              Extraction
            </button>
            <button
              onClick={() => setActiveTab('summarize')}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'summarize'
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              Summarization
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'extract' && (
          <div className="animate-fade-in-up">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Document Extraction</h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Upload up to 5 documents (PDF, Images) to automatically classify and extract structured data.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-10">
              <FileUploader
                onUpload={handleExtractionUpload}
                isLoading={isLoading}
                label="Upload for Extraction"
              />
            </div>

            <ResultsDisplay results={extractionResults} />
          </div>
        )}

        {activeTab === 'summarize' && (
          <div className="animate-fade-in-up">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold text-indigo-900 sm:text-4xl">Document Summarization</h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Get concise summaries of your documents powered by AI.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-10">
              <FileUploader
                onUpload={handleSummarizationUpload}
                isLoading={isLoading}
                label="Upload for Summarization"
              />
            </div>

            <SummaryDisplay results={summaryResults} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-auto border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2026 Document Processing AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
