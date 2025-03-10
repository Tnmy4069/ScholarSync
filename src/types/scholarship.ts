export interface AadharData {
  aadhar_no: string;
  name: string;
  dob: string;
  gender: string;
  address: string;
}

export interface CapData {
  cap_id: string;
  name_as_per_lc: string;
  income_certificate_no: string;
  income_issuing_authority: string;
  income_issue_date: string;
  family_annual_income: number;
  domicile_certificate_no: string;
  domicile_issuing_authority: string;
  domicile_issue_date: string;
  caste_category: string;
  caste_certificate_no: string;
  caste_issuing_district: string;
  caste_issuing_authority: string;
  ssc_seat_no: string;
  ssc_year: number;
  ssc_school_name: string;
  hsc_seat_no: string;
  hsc_year: number;
  hsc_college_name: string;
  course_name: string;
}

export interface FamilyDetails {
  student_salaried: boolean;
  father_alive: boolean;
  father_working: boolean;
  father_occupation: string;
  mother_alive: boolean;
  mother_working: boolean;
  mother_occupation: string;
}

export interface ScholarshipApplication extends AadharData, CapData, FamilyDetails {
  id?: number;
  marksheet_upload?: File;
  application_number?: string;
} 