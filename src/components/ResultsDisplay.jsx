import React, { useState } from 'react';
import {
    ArrowsPointingOutIcon,
    CheckCircleIcon,
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon,
    PencilSquareIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';

const IMAGE_URL_PATTERN = /\.(png|jpe?g|webp|gif|bmp|tiff|svg)(\?|$)/i;

const isImageUrl = (url) => typeof url === 'string' && IMAGE_URL_PATTERN.test(url);

const getPreviewUrl = (result = {}) => {
    const candidates = [
        result.imageUrl,
        result.imageSignedUrl,
        result.signedImageUrl,
        result.previewUrl,
        result.originalSignedUrl,
        result.signedUrl
    ];

    return candidates.find((url) => isImageUrl(url)) || null;
};

const hashFieldColor = (field) => {
    const hash = field.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const hue = hash % 360;

    return {
        border: `hsl(${hue} 80% 45%)`,
        fill: `hsla(${hue} 80% 45% / 0.2)`
    };
};

const getHighlightsFromCoordinates = (coordinates = {}) => {
    return Object.entries(coordinates).flatMap(([field, fieldRegions]) => {
        if (!Array.isArray(fieldRegions)) return [];

        return fieldRegions.map((region, idx) => {
            const normalizedVertices = region?.normalizedVertices || [];
            if (!normalizedVertices.length) return null;

            const xs = normalizedVertices.map((point) => point?.x).filter((x) => typeof x === 'number');
            const ys = normalizedVertices.map((point) => point?.y).filter((y) => typeof y === 'number');
            if (!xs.length || !ys.length) return null;

            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            if (maxX <= minX || maxY <= minY) return null;

            return {
                id: `${field}-${idx}`,
                field,
                left: minX,
                top: minY,
                width: maxX - minX,
                height: maxY - minY
            };
        }).filter(Boolean);
    });
};

const DocumentImageWithHighlights = ({ result, previewUrl, hidden, onHide, showEnlargeButton, onEnlarge }) => {
    if (!previewUrl || hidden) return null;

    const highlights = getHighlightsFromCoordinates(result?.coordinates);

    return (
        <div className="relative rounded-md border border-gray-200 overflow-hidden bg-white">
            {showEnlargeButton && (
                <button
                    type="button"
                    onClick={onEnlarge}
                    className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 text-gray-700 text-xs border border-gray-200 hover:bg-white"
                >
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                    Enlarge
                </button>
            )}
            <img
                src={previewUrl}
                alt={result?.sourceFile?.split('/').pop() || 'Document'}
                className="w-full h-auto block"
                onError={onHide}
            />

            <div className="absolute inset-0 pointer-events-none">
                {highlights.map((highlight) => {
                    const color = hashFieldColor(highlight.field);
                    return (
                        <div
                            key={highlight.id}
                            className="absolute border-2"
                            style={{
                                left: `${highlight.left * 100}%`,
                                top: `${highlight.top * 100}%`,
                                width: `${highlight.width * 100}%`,
                                height: `${highlight.height * 100}%`,
                                borderColor: color.border,
                                backgroundColor: color.fill
                            }}
                        >
                            <span
                                className="absolute -top-5 left-0 text-[10px] leading-none px-1 py-0.5 rounded text-white"
                                style={{ backgroundColor: color.border }}
                            >
                                {highlight.field}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ResultsDisplay = ({ results }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [editedDataByIndex, setEditedDataByIndex] = useState({});
    const [hiddenPreviewByIndex, setHiddenPreviewByIndex] = useState({});
    const [closedCardByIndex, setClosedCardByIndex] = useState({});
    const [imageModalState, setImageModalState] = useState({ isOpen: false, result: null, previewUrl: null });
    const [zoomLevel, setZoomLevel] = useState(1);

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
    const getDocumentName = (result) => result?.sourceFile?.split('/').pop() || 'Document';

    const openImageModal = (result, previewUrl) => {
        setImageModalState({ isOpen: true, result, previewUrl });
        setZoomLevel(1);
    };

    const closeImageModal = () => {
        setImageModalState({ isOpen: false, result: null, previewUrl: null });
        setZoomLevel(1);
    };

    const handleZoomIn = () => setZoomLevel((prev) => Math.min(3, Number((prev + 0.25).toFixed(2))));
    const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))));

    const closeResultCard = (index) => {
        setClosedCardByIndex((prev) => ({ ...prev, [index]: true }));
        if (selectedIndex === index) {
            closeEditor();
        }
    };

    if (!results || results.length === 0) return null;

    return (
        <>
            <div className="mt-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Extraction Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((result, index) => {
                        if (closedCardByIndex[index]) return null;

                        const displayData = getDisplayData(index, result);
                        const hasData = Object.keys(displayData).length > 0;
                        const previewUrl = getPreviewUrl(result);
                        const hasNonImageSignedUrl = Boolean(result?.signedUrl) && !isImageUrl(result?.signedUrl);

                        return (
                            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
                                <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                                    <span className="font-semibold text-blue-800">{result.type}</span>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                        <button
                                            type="button"
                                            onClick={() => closeResultCard(index)}
                                            className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-white/70"
                                            aria-label="Close card"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {previewUrl && !hiddenPreviewByIndex[index] && (
                                    <div className="px-4 pt-4">
                                        <DocumentImageWithHighlights
                                            result={result}
                                            previewUrl={previewUrl}
                                            hidden={hiddenPreviewByIndex[index]}
                                            onHide={() => setHiddenPreviewByIndex((prev) => ({ ...prev, [index]: true }))}
                                            showEnlargeButton
                                            onEnlarge={() => openImageModal(result, previewUrl)}
                                        />
                                    </div>
                                )}
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
                                    {!previewUrl && hasNonImageSignedUrl && (
                                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1 mt-2">
                                            Preview unavailable: `signedUrl` is not an image URL.
                                        </p>
                                    )}
                                </div>
                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
                                    <span className="text-xs text-gray-400 truncate">
                                        Source: {getDocumentName(result)}
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
                                    {getDocumentName(results[selectedIndex])}
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
                            {(() => {
                                const selectedResult = results[selectedIndex];
                                const selectedPreviewUrl = getPreviewUrl(selectedResult);
                                const hasNonImageSignedUrl = Boolean(selectedResult?.signedUrl) && !isImageUrl(selectedResult?.signedUrl);

                                if (selectedPreviewUrl && !hiddenPreviewByIndex[selectedIndex]) {
                                    return (
                                        <DocumentImageWithHighlights
                                            result={selectedResult}
                                            previewUrl={selectedPreviewUrl}
                                            hidden={hiddenPreviewByIndex[selectedIndex]}
                                            onHide={() => setHiddenPreviewByIndex((prev) => ({ ...prev, [selectedIndex]: true }))}
                                            showEnlargeButton
                                            onEnlarge={() => openImageModal(selectedResult, selectedPreviewUrl)}
                                        />
                                    );
                                }

                                if (!selectedPreviewUrl && hasNonImageSignedUrl) {
                                    return (
                                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                                            Preview unavailable: `signedUrl` points to a non-image file.
                                        </p>
                                    );
                                }

                                return null;
                            })()}

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

            {imageModalState.isOpen && (
                <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Image Viewer</h3>
                                <p className="text-xs text-gray-500">{getDocumentName(imageModalState.result)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleZoomOut}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    <MagnifyingGlassMinusIcon className="w-4 h-4" />
                                    Zoom Out
                                </button>
                                <button
                                    type="button"
                                    onClick={handleZoomIn}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    <MagnifyingGlassPlusIcon className="w-4 h-4" />
                                    Zoom In
                                </button>
                                <button
                                    type="button"
                                    onClick={closeImageModal}
                                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4 bg-gray-50">
                            <div
                                className="mx-auto origin-top-left"
                                style={{
                                    transform: `scale(${zoomLevel})`,
                                    width: `${100 / zoomLevel}%`
                                }}
                            >
                                <DocumentImageWithHighlights
                                    result={imageModalState.result}
                                    previewUrl={imageModalState.previewUrl}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResultsDisplay;
