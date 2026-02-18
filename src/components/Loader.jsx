import React from 'react';

const Loader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity">
            <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center transform transition-all scale-100">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800">Processing Documents</h3>
                <p className="text-gray-500 text-sm mt-2">Please wait while we classify and extract data...</p>
            </div>
        </div>
    );
};

export default Loader;
