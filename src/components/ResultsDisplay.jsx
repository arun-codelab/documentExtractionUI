import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const ResultsDisplay = ({ results }) => {
    if (!results || results.length === 0) return null;

    return (
        <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Extraction Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
                        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                            <span className="font-semibold text-blue-800">{result.type}</span>
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="p-4">
                            {result.data && Object.entries(result.data).map(([key, value]) => (
                                <div key={key} className="mb-2 last:mb-0">
                                    <span className="text-xs text-gray-500 uppercase font-medium">{key}</span>
                                    <p className="text-sm text-gray-800 font-medium break-words">{String(value)}</p>
                                </div>
                            ))}
                            {(!result.data || Object.keys(result.data).length === 0) && (
                                <p className="text-sm text-gray-500 italic">No data extracted.</p>
                            )}
                        </div>
                        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400 truncate border-t border-gray-100">
                            Source: {result.sourceFile?.split('/').pop()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResultsDisplay;
