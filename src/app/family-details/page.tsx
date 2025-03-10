"use client"
import FamilyDetailsForm from '@/components/FamilyDetailsForm';

export default function FamilyDetails() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        MahaDBT Scholarship Application
      </h1>
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-6">
          Step 3: Family & Employment Details
        </h2>
        <FamilyDetailsForm />
      </div>
    </div>
  );
} 