import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const VerificationForm = () => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      aadhar_no: '',
      cap_id: '',
    },
    validationSchema: Yup.object({
      aadhar_no: Yup.string()
        .matches(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits')
        .required('Aadhaar number is required'),
      cap_id: Yup.string()
        .matches(/^[A-Z0-9]{8,}$/, 'Invalid CAP ID format')
        .required('CAP ID is required'),
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch('/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error('Verification failed');
        }

        const data = await response.json();
        
        // Store verified data in localStorage
        localStorage.setItem('verifiedData', JSON.stringify(data));
        
        toast.success('Verification successful!');
        router.push('/personal-details');
      } catch (error) {
        toast.error('Verification failed. Please check your details.');
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="aadhar_no" className="block text-sm font-medium mb-2">
          Aadhaar Number
        </label>
        <input
          id="aadhar_no"
          type="text"
          {...formik.getFieldProps('aadhar_no')}
          className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Enter 12-digit Aadhaar number"
        />
        {formik.touched.aadhar_no && formik.errors.aadhar_no && (
          <div className="text-red-500 text-sm mt-1">{formik.errors.aadhar_no}</div>
        )}
      </div>

      <div>
        <label htmlFor="cap_id" className="block text-sm font-medium mb-2">
          CAP ID
        </label>
        <input
          id="cap_id"
          type="text"
          {...formik.getFieldProps('cap_id')}
          className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Enter your CAP ID"
        />
        {formik.touched.cap_id && formik.errors.cap_id && (
          <div className="text-red-500 text-sm mt-1">{formik.errors.cap_id}</div>
        )}
      </div>

      <button
        type="submit"
        disabled={formik.isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formik.isSubmitting ? 'Verifying...' : 'Verify & Continue'}
      </button>
    </form>
  );
};

export default VerificationForm; 