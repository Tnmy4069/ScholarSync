'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

interface ApplicationData {
  id: number;
  name: string;
  course_name: string;
  year_of_study: number;
  created_at: string | null;
  updated_at: string | null;
  student_salaried: boolean;
  father_alive: boolean;
  father_working: boolean;
  father_occupation: string | null;
  mother_alive: boolean;
  mother_working: boolean;
  mother_occupation: string | null;
  marksheet_upload: string | null;
  aadhar_no: string;
  cap_id: string;
}

export default function TrackApplication() {
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      applicationId: '',
    },
    validationSchema: Yup.object({
      applicationId: Yup.string()
        .required('Application ID is required')
        .matches(/^\d+$/, 'Application ID must be a number'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setApplicationData(null);

        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

        try {
          const response = await fetch(`/api/track?id=${values.applicationId}`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Cache-Control': 'no-cache',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            throw new Error('Invalid response from server');
          }

          if (!response.ok) {
            let errorMessage = 'Failed to fetch application details';

            if (data && typeof data === 'object') {
              // Handle specific error codes
              switch (data.code) {
                case 'NOT_FOUND':
                  errorMessage = `Application with ID ${values.applicationId} was not found`;
                  break;
                case 'CONNECTION_ERROR':
                  errorMessage = 'Unable to connect to the database. Please try again later';
                  break;
                case 'TABLE_ERROR':
                  errorMessage = 'Database configuration error. Please contact support';
                  break;
                default:
                  errorMessage = data.error || data.details || errorMessage;
              }
            }

            console.error('API Error:', {
              status: response.status,
              statusText: response.statusText,
              data: data,
            });

            throw new Error(errorMessage);
          }

          // Validate the response data
          if (!data || typeof data !== 'object') {
            console.error('Invalid response format:', data);
            throw new Error('Invalid response format received');
          }

          if (!data.id || !data.name) {
            console.error('Incomplete data:', data);
            throw new Error('Incomplete application data received');
          }

          setApplicationData(data);
          toast.success('Application details fetched successfully');
        } catch (fetchError: unknown) {
          if (fetchError instanceof Error) {
            if (fetchError.name === 'AbortError') {
              throw new Error('Request timed out. Please try again.');
            }
            throw fetchError;
          }
          throw new Error('An unknown error occurred');
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching application:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });

          let errorMessage = error.message || 'Failed to fetch application details';

          if (!navigator.onLine) {
            errorMessage = 'No internet connection. Please check your network.';
          } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
            errorMessage = 'Unable to connect to the server. Please try again later.';
          }

          setError(errorMessage);
          toast.error(errorMessage);
        } else {
          console.error('An unknown error occurred:', error);
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const getStatusBadge = () => {
    if (!applicationData) return null;

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-500">
        Under Review
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not Available';

    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Application</h1>

        <form onSubmit={formik.handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 mb-8">
          <div className="mb-4">
            <label htmlFor="applicationId" className="block text-sm font-medium text-gray-700 mb-1">
              Application ID
            </label>
            <input
              id="applicationId"
              name="applicationId"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.applicationId}
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                formik.touched.applicationId && formik.errors.applicationId
                  ? 'ring-red-500 focus:ring-red-500'
                  : 'ring-gray-300 focus:ring-indigo-600'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
              placeholder="Enter your application ID"
            />
            {formik.touched.applicationId && formik.errors.applicationId && (
              <p className="mt-2 text-sm text-red-600">{formik.errors.applicationId}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Fetching details...
              </div>
            ) : (
              'Track Application'
            )}
          </button>
        </form>

        {error && <div className="rounded-md bg-red-50 p-4 mb-8">{error}</div>}
      </div>
    </div>
  );
}
