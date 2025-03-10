import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState } from 'react';

const FamilyDetailsForm = () => {
  const router = useRouter();
  const [marksheetFile, setMarksheetFile] = useState<File | null>(null);

  const formik = useFormik({
    initialValues: {
      student_salaried: false,
      father_alive: true,
      father_working: true,
      father_occupation: '',
      mother_alive: true,
      mother_working: false,
      mother_occupation: '',
      current_year: '1',
    },
    
    validationSchema: Yup.object({
      father_occupation: Yup.string().when('father_working', {
        is: true,
        then: (schema) => schema.required('Father\'s occupation is required'),
      }),
      mother_occupation: Yup.string().when('mother_working', {
        is: true,
        then: (schema) => schema.required('Mother\'s occupation is required'),
      }),
      current_year: Yup.string().required('Current year is required'),
    }),
    
    onSubmit: async (values) => {
      try {
        // Validate father's occupation if working
        if (values.father_working && !values.father_occupation?.trim()) {
          toast.error('Father\'s occupation is required when working');
          return;
        }

        // Validate mother's occupation if working
        if (values.mother_working && !values.mother_occupation?.trim()) {
          toast.error('Mother\'s occupation is required when working');
          return;
        }

        const formData = new FormData();
        
        // Add all form values to FormData
        Object.keys(values).forEach((key) => {
          const value = values[key as keyof typeof values];
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Add marksheet file if present and not first year
        if (marksheetFile && values.current_year !== '1') {
          formData.append('marksheet', marksheetFile);
        } else if (values.current_year !== '1' && !marksheetFile) {
          toast.error('Please upload your previous year marksheet');
          return;
        }

        const response = await fetch('/api/family-details', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Server error:', data);
          throw new Error(data.details || data.error || 'Failed to save family details');
        }

        toast.success('Application submitted successfully!');
        
        // Store the application ID in localStorage for reference
        if (data.applicationId) {
          localStorage.setItem('applicationId', data.applicationId.toString());
        }
        
        router.push('/success');
      } catch (error: any) {
        console.error('Error submitting application:', error);
        toast.error(error.message || 'Failed to submit application. Please try again.');
      }
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or image file (JPEG/PNG)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('File size should be less than 5MB');
        return;
      }

      setMarksheetFile(file);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-8">
      {/* Student Employment Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Student Employment Status</h3>
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...formik.getFieldProps('student_salaried')}
              checked={formik.values.student_salaried}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span>Is Student Salaried?</span>
          </label>
        </div>
      </div>

      {/* Father's Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Father's Details</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...formik.getFieldProps('father_alive')}
              checked={formik.values.father_alive}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span>Father Alive?</span>
          </label>

          {formik.values.father_alive && (
            <>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...formik.getFieldProps('father_working')}
                  checked={formik.values.father_working}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span>Father Working?</span>
              </label>

              {formik.values.father_working && (
                <div>
                  <label htmlFor="father_occupation" className="block text-sm font-medium mb-2">
                    Father's Occupation
                  </label>
                  <input
                    id="father_occupation"
                    type="text"
                    {...formik.getFieldProps('father_occupation')}
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {formik.touched.father_occupation && formik.errors.father_occupation && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.father_occupation}</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mother's Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Mother's Details</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...formik.getFieldProps('mother_alive')}
              checked={formik.values.mother_alive}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span>Mother Alive?</span>
          </label>

          {formik.values.mother_alive && (
            <>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...formik.getFieldProps('mother_working')}
                  checked={formik.values.mother_working}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span>Mother Working?</span>
              </label>

              {formik.values.mother_working && (
                <div>
                  <label htmlFor="mother_occupation" className="block text-sm font-medium mb-2">
                    Mother's Occupation
                  </label>
                  <input
                    id="mother_occupation"
                    type="text"
                    {...formik.getFieldProps('mother_occupation')}
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {formik.touched.mother_occupation && formik.errors.mother_occupation && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.mother_occupation}</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Academic Year Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Current Academic Year</h3>
        <div>
          <select
            id="current_year"
            {...formik.getFieldProps('current_year')}
            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          {formik.touched.current_year && formik.errors.current_year && (
            <div className="text-red-500 text-sm mt-1">{formik.errors.current_year}</div>
          )}
        </div>

        {formik.values.current_year !== '1' && (
          <div>
            <label htmlFor="marksheet" className="block text-sm font-medium mb-2">
              Previous Year Marksheet
            </label>
            <input
              id="marksheet"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {marksheetFile && (
              <div className="mt-2 text-sm text-gray-300">
                Selected file: {marksheetFile.name}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {formik.isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
};

export default FamilyDetailsForm; 