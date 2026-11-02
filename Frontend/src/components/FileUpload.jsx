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

        try {
            const content = await extractTextFromFile(file);
            if (!content || !content.trim()) {
                toast.error('❌ No readable text found in this file');
                return;
            }

            onFileUpload(content);
            toast.success(`✅ Loaded: ${file.name}`);
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('❌ Failed to read file');
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
        <div className="space-y-3">
            <div
                {...getRootProps()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all ${
                    isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-blue-400/40'
                } ${loading ? 'cursor-not-allowed opacity-50' : ''} ${text ? 'border-green-500/40 bg-green-500/5' : ''}`}
            >
                <input {...getInputProps()} />

                {text ? (
                    <div className="flex items-center justify-center gap-3">
                        <FiFile className="h-5 w-5 text-green-400" />
                        <span className="text-sm font-medium text-slate-200">File loaded ({text.length} characters)</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                clearFile();
                            }}
                            className="rounded-full p-1 transition hover:bg-red-500/10"
                        >
                            <FiX className="h-4 w-4 text-red-400" />
                        </button>
                    </div>
                ) : (
                    <div>
                        <FiUpload className="mx-auto mb-2 h-7 w-7 text-slate-400" />
                        {isDragActive ? (
                            <p className="text-sm font-medium text-blue-400">Drop the file here...</p>
                        ) : (
                            <div>
                                <p className="text-sm font-medium text-slate-300">Upload a file or drag and drop</p>
                                <p className="mt-1 text-xs text-slate-500">Supports .txt, .md, .docx, .pdf (max 10MB)</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;