import React, { useState } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const FileUploader = ({ onUpload, isLoading, label = "Upload Documents" }) => {
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        // Limit to 5 files
        if (files.length + selectedFiles.length > 5) {
            alert("You can only upload a maximum of 5 files.");
            return;
        }
        setFiles((prev) => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('documents', file);
        });

        onUpload(formData);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{label}</h2>

            <div className="flex items-center justify-center w-full">
                <label
                    htmlFor="dropzone-file"
                    className={clsx(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors",
                        isLoading ? "opacity-50 cursor-not-allowed" : "border-gray-300 hover:border-blue-500"
                    )}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CloudArrowUpIcon className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG (MAX. 5 files)</p>
                    </div>
                    <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                        disabled={isLoading}
                        accept=".pdf,.jpg,.jpeg,.png"
                    />
                </label>
            </div>

            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm truncate text-gray-700">{file.name}</span>
                            <button
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={files.length === 0 || isLoading}
                className={clsx(
                    "w-full mt-4 px-4 py-2 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:outline-none",
                    isLoading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
                )}
            >
                {isLoading ? 'Processing...' : 'Upload & Process'}
            </button>
        </div>
    );
};

export default FileUploader;
