'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Success() {
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('applicationId');
    setApplicationId(id);
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
          >
            <circle
              className="opacity-25"
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M14 24l8 8 16-16"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Application Submitted Successfully!</h1>
        
        {applicationId && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300 mb-2">Your Application Tracking ID</p>
            <p className="text-xl font-mono font-bold text-blue-400">{applicationId}</p>
            <p className="text-sm text-gray-400 mt-2">
              Please save this ID for future reference
            </p>
          </div>
        )}

        <p className="text-gray-300 mb-8">
          You will receive further communication regarding your application status via email.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/track"
            className="inline-block px-6 py-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Track Application
          </Link>
        </div>
      </div>
    </div>
  );
} 