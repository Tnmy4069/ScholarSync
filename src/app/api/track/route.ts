import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

interface ApplicationRow extends RowDataPacket {
  id: number;
  name: string;
  course_name: string;
  year_of_study: number;
  created_at: Date;
  updated_at: Date;
  student_salaried: number;
  father_alive: number;
  father_working: number;
  father_occupation: string | null;
  mother_alive: number;
  mother_working: number;
  mother_occupation: string | null;
  marksheet_upload: string | null;
  aadhar_no: string;
  cap_id: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Application ID is required' },
      { status: 400 }
    );
  }

  let connection;
  try {
    // Create MySQL connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'scholarship_db'
    });

    console.log('Database connected successfully');

    // Get application details
    const [rows] = await connection.execute<ApplicationRow[]>(
      `SELECT 
        id, 
        name, 
        course_name, 
        year_of_study,
        created_at, 
        updated_at,
        student_salaried, 
        father_alive, 
        father_working,
        father_occupation, 
        mother_alive, 
        mother_working,
        mother_occupation, 
        marksheet_upload,
        aadhar_no,
        cap_id
      FROM scholarship_applications
      WHERE id = ?
      LIMIT 1`,
      [id]
    );

    console.log('Query executed, rows:', rows);

    if (rows.length === 0) {
      console.log('No application found with ID:', id);
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const applicationData = rows[0];
    console.log('Application data found:', applicationData);

    // Format the response data
    const formattedData = {
      id: applicationData.id,
      name: applicationData.name,
      course_name: applicationData.course_name,
      year_of_study: applicationData.year_of_study,
      created_at: applicationData.created_at?.toISOString() || null,
      updated_at: applicationData.updated_at?.toISOString() || null,
      student_salaried: Boolean(applicationData.student_salaried),
      father_alive: Boolean(applicationData.father_alive),
      father_working: Boolean(applicationData.father_working),
      father_occupation: applicationData.father_occupation,
      mother_alive: Boolean(applicationData.mother_alive),
      mother_working: Boolean(applicationData.mother_working),
      mother_occupation: applicationData.mother_occupation,
      marksheet_upload: applicationData.marksheet_upload,
      aadhar_no: applicationData.aadhar_no,
      cap_id: applicationData.cap_id
    };

    return NextResponse.json(formattedData);
  } catch (error: unknown) {
    console.error('Detailed error in tracking API:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch application details',
        details: error instanceof Error ? error.message : 'Database connection failed',
        code: 'DB_ERROR'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
} 