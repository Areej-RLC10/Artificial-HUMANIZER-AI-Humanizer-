// src/components/FileUpload.jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { extractTextFromFile } from '../utils/fileParsers';

const FileUpload = ({ onFileUpload, loading, text }) => {
    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const toastId = toast.loading(`Reading ${file.name}...`);

        try {
            const content = await extractTextFromFile(file);
            if (!content || !content.trim()) {
                toast.error('❌ No readable text found in this file', { id: toastId });
                return;
            }

            onFileUpload(content);
            toast.success(`✅ Loaded: ${file.name}`, { id: toastId });
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('❌ Failed to read file', { id: toastId });
        }
    }, [onFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/pdf': ['.pdf'],
        },
        maxSize: 10485760,
        maxFiles: 1,
        disabled: loading
    });

    const clearFile = () => {
        onFileUpload('');
        toast.success('File cleared');
    };

    return (
        <div 
            {...getRootProps()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all 
                ${isDragActive ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-emerald-500 bg-gray-50 dark:bg-gray-800'}
                ${loading ? 'cursor-not-allowed opacity-50' : ''} 
                ${text ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
            `}
        >
            <input {...getInputProps()} />

            {text ? (
                <div className="flex items-center justify-center gap-3">
                    <FiFile className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        File loaded ({text.length} characters)
                    </span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            clearFile();
                        }}
                        className="rounded-full p-1 transition hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                        <FiX className="h-4 w-4 text-red-500 dark:text-red-400" />
                    </button>
                </div>
            ) : (
                <div>
                    <FiUpload className="mx-auto mb-2 h-6 w-6 text-gray-400 dark:text-gray-500" />
                    {isDragActive ? (
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Drop the file here...</p>
                    ) : (
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Upload a file or drag and drop
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Supports .txt, .md, .docx, .pdf (max 10MB)
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUpload;