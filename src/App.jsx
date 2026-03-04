import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import ResultsDisplay from './components/ResultsDisplay';
import Loader from './components/Loader';

import { fetchBatchResults, uploadDocuments } from './services/api';
import { clsx } from 'clsx';
import {
  EnvelopeIcon,
  DocumentMagnifyingGlassIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  RectangleStackIcon
} from '@heroicons/react/24/solid';

function App() {
  const [activeSection, setActiveSection] = useState('document-processing');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [extractionResults, setExtractionResults] = useState([]);
  const [resultsViewKey, setResultsViewKey] = useState(0);
  const [emailBatches, setEmailBatches] = useState([]);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExtractionUpload = async (formData) => {
    setIsLoading(true);
    setError(null);
    setExtractionResults([]);

    try {
      const response = await uploadDocuments(formData);
      setExtractionResults(response.results || []);
      setResultsViewKey((prev) => prev + 1);
      setIsUploadModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during extraction.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBatchResults = async () => {
    setIsBatchLoading(true);
    setError(null);
    try {
      const response = await fetchBatchResults();
      setEmailBatches(response.batches || []);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while fetching batch results.');
      setEmailBatches([]);
    } finally {
      setIsBatchLoading(false);
    }
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
    if (section === 'email-batches') {
      loadBatchResults();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-md">
              <DocumentMagnifyingGlassIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
              <p className="text-xs text-slate-400 mt-1">Document Operations</p>
            </div>
          </div>
        </div>

        <nav className="px-4 py-5">
          <button
            onClick={() => handleSectionClick('document-processing')}
            className={clsx(
              'w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
              activeSection === 'document-processing'
                ? 'bg-blue-600 text-white'
                : 'text-slate-200 hover:bg-slate-800'
            )}
          >
            <RectangleStackIcon className="h-5 w-5" />
            Document Processing
          </button>
          <button
            onClick={() => handleSectionClick('email-batches')}
            className={clsx(
              'w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
              activeSection === 'email-batches'
                ? 'bg-blue-600 text-white'
                : 'text-slate-200 hover:bg-slate-800'
            )}
          >
            <EnvelopeIcon className="h-5 w-5" />
            Email Batch Results
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">
            {activeSection === 'document-processing' ? 'Document Processing' : 'Email Batch Results'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {activeSection === 'document-processing'
              ? 'Upload documents and review classified plus extracted results.'
              : 'Review documents extracted from email attachments and stored in the database.'}
          </p>
        </header>

        <main className="flex-1 p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {activeSection === 'document-processing' && (
              <>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Manage Uploads</h3>
                      <p className="text-sm text-slate-500 mt-1">Use the upload action to process new documents.</p>
                    </div>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      Upload Image
                    </button>
                  </div>
                </div>

                <ResultsDisplay key={resultsViewKey} results={extractionResults} />
              </>
            )}

            {activeSection === 'email-batches' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Email Attachment Processing</h3>
                      <p className="text-sm text-slate-500 mt-1">Fetch and review processed batch results from backend.</p>
                    </div>
                    <button
                      onClick={loadBatchResults}
                      disabled={isBatchLoading}
                      className={clsx(
                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        isBatchLoading
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      {isBatchLoading ? 'Loading...' : 'Refresh Results'}
                    </button>
                  </div>
                </div>

                {!isBatchLoading && emailBatches.length === 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                    <p className="text-sm text-slate-600">No email batches found.</p>
                  </div>
                )}

                {emailBatches.map((batch) => (
                  <div key={batch.id || batch.batchId} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                    <div className="mb-4">
                      <h4 className="text-base font-semibold text-slate-900">
                        Email From: {batch.emailFrom || '-'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">Batch DB ID: {batch.id}</p>
                      <p className="text-xs text-slate-500 mt-1">Processed Documents: {batch.processedDocs || 0}</p>
                      <p className="text-xs text-slate-500 mt-1">Received At: {batch.receivedAt || '-'}</p>
                    </div>
                    <ResultsDisplay key={`${batch.id}-${batch.receivedAt || ''}`} results={batch.results || []} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Upload Image</h3>
                <p className="text-xs text-slate-500 mt-1">Select one or more files to process.</p>
              </div>
              <button
                onClick={() => !isLoading && setIsUploadModalOpen(false)}
                className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <FileUploader
                onUpload={handleExtractionUpload}
                isLoading={isLoading}
                label="Upload for Extraction"
              />
            </div>
          </div>
        </div>
      )}

      {isLoading && <Loader />}
    </div>
  );
}

export default App;
