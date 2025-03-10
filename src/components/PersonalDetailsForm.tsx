import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

const PersonalDetailsForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      // Personal Details
      name: '',
      dob: '',
      gender: '',
      address: '',
      
      // Income Details
      annual_income: '',
      income_certificate_no: '',
      income_issuing_authority: '',
      income_issue_date: '',
      
      // Domicile Details
      domicile_certificate_no: '',
      domicile_issuing_authority: '',
      domicile_issue_date: '',
      
      // Caste Details
      category: '',
      caste_certificate_no: '',
      caste_issuing_district: '',
      caste_issuing_authority: '',
      
      // Academic Details
      ssc_school: '',
      hsc_college: '',
      current_course: '',
    },
    
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      dob: Yup.date().required('Date of Birth is required'),
      gender: Yup.string().required('Gender is required'),
      address: Yup.string().required('Address is required'),
      
      annual_income: Yup.number()
        .required('Annual Income is required')
        .positive('Annual Income must be positive'),
      income_certificate_no: Yup.string().required('Income Certificate No. is required'),
      income_issuing_authority: Yup.string().required('Issuing Authority is required'),
      income_issue_date: Yup.date().required('Issue Date is required'),
      
      domicile_certificate_no: Yup.string().required('Domicile Certificate No. is required'),
      domicile_issuing_authority: Yup.string().required('Issuing Authority is required'),
      domicile_issue_date: Yup.date().required('Issue Date is required'),
      
      category: Yup.string().required('Category is required'),
      caste_certificate_no: Yup.string().required('Caste Certificate No. is required'),
      caste_issuing_district: Yup.string().required('Issuing District is required'),
      caste_issuing_authority: Yup.string().required('Issuing Authority is required'),
      
      ssc_school: Yup.string().required('SSC School name is required'),
      hsc_college: Yup.string().required('HSC College name is required'),
      current_course: Yup.string().required('Current Course is required'),
    }),
    
    onSubmit: async (values) => {
      try {
        // Get the stored verification data
        const storedData = localStorage.getItem('verifiedData');
        if (!storedData) {
          toast.error('Verification data not found. Please verify your details first.');
          router.push('/');
          return;
        }

        const { aadhar, cap } = JSON.parse(storedData);

        // Combine the form values with verification data
        const submitData = {
          ...values,
          aadhar_no: aadhar.aadhar_no,
          cap_id: cap.cap_id,
        };

        const response = await fetch('/api/personal-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save personal details');
        }

        toast.success('Personal details saved successfully!');
        router.push('/family-details');
      } catch (error: any) {
        console.error('Error saving personal details:', error);
        toast.error(error.message || 'Failed to save personal details. Please try again.');
      }
    },
  });

  // Load verified data from localStorage on component mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem('verifiedData');
        if (!storedData) {
          toast.error('No verified data found. Please complete verification first.');
          router.push('/');
          return;
        }

        const { aadhar, cap } = JSON.parse(storedData);

        // Pre-fill form with Aadhaar and CAP data
        formik.setValues({
          ...formik.values,
          // Personal Details from Aadhaar
          name: aadhar.name || '',
          dob: aadhar.dob?.split('T')[0] || '', // Format date to YYYY-MM-DD
          gender: aadhar.gender?.toLowerCase() || '',
          address: aadhar.address || '',
          
          // Details from CAP
          annual_income: cap.family_annual_income?.toString() || '',
          income_certificate_no: cap.income_certificate_no || '',
          income_issuing_authority: cap.income_issuing_authority || '',
          income_issue_date: cap.income_issue_date?.split('T')[0] || '',
          
          domicile_certificate_no: cap.domicile_certificate_no || '',
          domicile_issuing_authority: cap.domicile_issuing_authority || '',
          domicile_issue_date: cap.domicile_issue_date?.split('T')[0] || '',
          
          category: cap.caste_category || '',
          caste_certificate_no: cap.caste_certificate_no || '',
          caste_issuing_district: cap.caste_issuing_district || '',
          caste_issuing_authority: cap.caste_issuing_authority || '',
          
          ssc_school: cap.ssc_school_name || '',
          hsc_college: cap.hsc_college_name || '',
          current_course: cap.course_name || '',
        });
      }
    } catch (error) {
      console.error('Error loading verified data:', error);
      toast.error('Failed to load verified data. Please try again.');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-8">
      {/* Personal Details Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              {...formik.getFieldProps('name')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
            )}
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium mb-2">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              {...formik.getFieldProps('dob')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.dob && formik.errors.dob && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.dob}</div>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium mb-2">
              Gender
            </label>
            <select
              id="gender"
              {...formik.getFieldProps('gender')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {formik.touched.gender && formik.errors.gender && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.gender}</div>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-2">
              Address
            </label>
            <textarea
              id="address"
              {...formik.getFieldProps('address')}
              rows={3}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.address}</div>
            )}
          </div>
        </div>
      </div>

      {/* Income Details Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Income Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="annual_income" className="block text-sm font-medium mb-2">
              Annual Income
            </label>
            <input
              id="annual_income"
              type="number"
              {...formik.getFieldProps('annual_income')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.annual_income && formik.errors.annual_income && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.annual_income}</div>
            )}
          </div>

          <div>
            <label htmlFor="income_certificate_no" className="block text-sm font-medium mb-2">
              Income Certificate No.
            </label>
            <input
              id="income_certificate_no"
              type="text"
              {...formik.getFieldProps('income_certificate_no')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.income_certificate_no && formik.errors.income_certificate_no && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.income_certificate_no}</div>
            )}
          </div>

          <div>
            <label htmlFor="income_issuing_authority" className="block text-sm font-medium mb-2">
              Issuing Authority
            </label>
            <input
              id="income_issuing_authority"
              type="text"
              {...formik.getFieldProps('income_issuing_authority')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.income_issuing_authority && formik.errors.income_issuing_authority && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.income_issuing_authority}</div>
            )}
          </div>

          <div>
            <label htmlFor="income_issue_date" className="block text-sm font-medium mb-2">
              Issue Date
            </label>
            <input
              id="income_issue_date"
              type="date"
              {...formik.getFieldProps('income_issue_date')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.income_issue_date && formik.errors.income_issue_date && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.income_issue_date}</div>
            )}
          </div>
        </div>
      </div>

      {/* Domicile Details Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Domicile Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="domicile_certificate_no" className="block text-sm font-medium mb-2">
              Domicile Certificate No.
            </label>
            <input
              id="domicile_certificate_no"
              type="text"
              {...formik.getFieldProps('domicile_certificate_no')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.domicile_certificate_no && formik.errors.domicile_certificate_no && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.domicile_certificate_no}</div>
            )}
          </div>

          <div>
            <label htmlFor="domicile_issuing_authority" className="block text-sm font-medium mb-2">
              Issuing Authority
            </label>
            <input
              id="domicile_issuing_authority"
              type="text"
              {...formik.getFieldProps('domicile_issuing_authority')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.domicile_issuing_authority && formik.errors.domicile_issuing_authority && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.domicile_issuing_authority}</div>
            )}
          </div>

          <div>
            <label htmlFor="domicile_issue_date" className="block text-sm font-medium mb-2">
              Issue Date
            </label>
            <input
              id="domicile_issue_date"
              type="date"
              {...formik.getFieldProps('domicile_issue_date')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.domicile_issue_date && formik.errors.domicile_issue_date && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.domicile_issue_date}</div>
            )}
          </div>
        </div>
      </div>

      {/* Caste Details Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Caste Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="category"
              {...formik.getFieldProps('category')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="OBC">OBC</option>
              <option value="GENERAL">General</option>
            </select>
            {formik.touched.category && formik.errors.category && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.category}</div>
            )}
          </div>

          <div>
            <label htmlFor="caste_certificate_no" className="block text-sm font-medium mb-2">
              Caste Certificate No.
            </label>
            <input
              id="caste_certificate_no"
              type="text"
              {...formik.getFieldProps('caste_certificate_no')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.caste_certificate_no && formik.errors.caste_certificate_no && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.caste_certificate_no}</div>
            )}
          </div>

          <div>
            <label htmlFor="caste_issuing_district" className="block text-sm font-medium mb-2">
              Issuing District
            </label>
            <input
              id="caste_issuing_district"
              type="text"
              {...formik.getFieldProps('caste_issuing_district')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.caste_issuing_district && formik.errors.caste_issuing_district && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.caste_issuing_district}</div>
            )}
          </div>

          <div>
            <label htmlFor="caste_issuing_authority" className="block text-sm font-medium mb-2">
              Issuing Authority
            </label>
            <input
              id="caste_issuing_authority"
              type="text"
              {...formik.getFieldProps('caste_issuing_authority')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.caste_issuing_authority && formik.errors.caste_issuing_authority && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.caste_issuing_authority}</div>
            )}
          </div>
        </div>
      </div>

      {/* Academic Details Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Academic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ssc_school" className="block text-sm font-medium mb-2">
              SSC School Name
            </label>
            <input
              id="ssc_school"
              type="text"
              {...formik.getFieldProps('ssc_school')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.ssc_school && formik.errors.ssc_school && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.ssc_school}</div>
            )}
          </div>

          <div>
            <label htmlFor="hsc_college" className="block text-sm font-medium mb-2">
              HSC College Name
            </label>
            <input
              id="hsc_college"
              type="text"
              {...formik.getFieldProps('hsc_college')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.hsc_college && formik.errors.hsc_college && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.hsc_college}</div>
            )}
          </div>

          <div>
            <label htmlFor="current_course" className="block text-sm font-medium mb-2">
              Current Course
            </label>
            <input
              id="current_course"
              type="text"
              {...formik.getFieldProps('current_course')}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formik.touched.current_course && formik.errors.current_course && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.current_course}</div>
            )}
          </div>
        </div>
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
          {formik.isSubmitting ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </form>
  );
};

export default PersonalDetailsForm; 