import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'name', 'dob', 'gender', 'address',
      'annual_income', 'income_certificate_no', 'income_issuing_authority', 'income_issue_date',
      'domicile_certificate_no', 'domicile_issuing_authority', 'domicile_issue_date',
      'category', 'caste_certificate_no', 'caste_issuing_district', 'caste_issuing_authority',
      'ssc_school', 'hsc_college', 'current_course',
      'aadhar_no', 'cap_id'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create MySQL connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'scholarship_db',
    });

    try {
      // Start transaction
      await connection.beginTransaction();

      // Insert into scholarship_applications table
      const [result] = await connection.execute(
        `INSERT INTO scholarship_applications (
          aadhar_no, cap_id, name, dob, gender, address,
          family_annual_income, income_certificate_no, income_issuing_authority, income_issue_date,
          domicile_certificate_no, domicile_issuing_authority, domicile_issue_date,
          caste_category, caste_certificate_no, caste_issuing_district, caste_issuing_authority,
          ssc_school_name, hsc_college_name, course_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

        [
          body.aadhar_no,
          body.cap_id,
          body.name,
          body.dob,
          body.gender,
          body.address,
          body.annual_income,
          body.income_certificate_no,
          body.income_issuing_authority,
          body.income_issue_date,
          body.domicile_certificate_no,
          body.domicile_issuing_authority,
          body.domicile_issue_date,
          body.category,
          body.caste_certificate_no,
          body.caste_issuing_district,
          body.caste_issuing_authority,
          body.ssc_school,
          body.hsc_college,
          body.current_course
        ]
      );

      // Commit transaction
      await connection.commit();

      // Explicitly type result as ResultSetHeader
      const insertId = (result as mysql.ResultSetHeader).insertId;

      return NextResponse.json({
        message: 'Personal details saved successfully',
        id: insertId,
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error: unknown) {
    console.error('Error saving personal details:', error);

    // Ensure error has a message property
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return NextResponse.json(
      { 
        error: 'Failed to save personal details',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
