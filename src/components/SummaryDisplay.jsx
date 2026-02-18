import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/solid';

const SummaryDisplay = ({ results }) => {
    if (!results || results.length === 0) return null;

    return (
        <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Summarization Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((result, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
                        <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex items-center mb-2">
                            <DocumentTextIcon className="w-5 h-5 text-indigo-500 mr-2" />
                            <span className="font-semibold text-indigo-800 truncate">{result.file?.split('/').pop() || 'Document'}</span>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                {result.summary}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SummaryDisplay;
