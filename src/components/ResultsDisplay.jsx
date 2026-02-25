import React, { useState } from 'react';
import { CheckCircleIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ResultsDisplay = ({ results }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [editedDataByIndex, setEditedDataByIndex] = useState({});

    const openEditor = (index) => {
        const sourceData = editedDataByIndex[index] || results[index]?.data || {};
        const normalizedData = Object.entries(sourceData).reduce((acc, [key, value]) => {
            acc[key] = value === null || value === undefined ? '' : String(value);
            return acc;
        }, {});

        setFormValues(normalizedData);
        setSelectedIndex(index);
    };

    const closeEditor = () => {
        setSelectedIndex(null);
        setFormValues({});
    };

    const handleFieldChange = (field, value) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (selectedIndex === null) return;
        setEditedDataByIndex((prev) => ({
            ...prev,
            [selectedIndex]: { ...formValues }
        }));
        closeEditor();
    };

    const getDisplayData = (index, result) => editedDataByIndex[index] || result.data || {};

    if (!results || results.length === 0) return null;

    return (
        <>
            <div className="mt-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Extraction Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((result, index) => {
                        const displayData = getDisplayData(index, result);
                        const hasData = Object.keys(displayData).length > 0;

                        return (
                            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
                                <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                                    <span className="font-semibold text-blue-800">{result.type}</span>
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                </div>
                                <div className="p-4">
                                    {hasData && Object.entries(displayData).map(([key, value]) => (
                                        <div key={key} className="mb-2 last:mb-0">
                                            <span className="text-xs text-gray-500 uppercase font-medium">{key}</span>
                                            <p className="text-sm text-gray-800 font-medium break-words">{String(value)}</p>
                                        </div>
                                    ))}
                                    {!hasData && (
                                        <p className="text-sm text-gray-500 italic">No data extracted.</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
                                    <span className="text-xs text-gray-400 truncate">
                                        Source: {result.sourceFile?.split('/').pop()}
                                    </span>
                                    <button
                                        onClick={() => openEditor(index)}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                        Edit
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedIndex !== null && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40" onClick={closeEditor} />
                    <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-gray-200 flex flex-col">
                        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Edit Document Data</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {results[selectedIndex]?.sourceFile?.split('/').pop() || 'Selected document'}
                                </p>
                                <p className="text-xs text-blue-700 font-medium mt-1">
                                    Type: {results[selectedIndex]?.type || 'Unknown'}
                                </p>
                            </div>
                            <button
                                onClick={closeEditor}
                                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
                            {Object.keys(formValues).length === 0 && (
                                <p className="text-sm text-gray-500">No editable fields found for this document.</p>
                            )}

                            {Object.entries(formValues).map(([field, value]) => (
                                <div key={field} className="space-y-1">
                                    <label className="block text-xs uppercase tracking-wide text-gray-500 font-semibold">
                                        {field}
                                    </label>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleFieldChange(field, e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
                            <button
                                onClick={closeEditor}
                                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResultsDisplay;
