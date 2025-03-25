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
      { 
        error: 'Application ID is required',
        code: 'VALIDATION_ERROR',
        details: 'Please provide a valid application ID'
      },
      { status: 400 }
    );
  }

  // Validate that id is numeric
  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      {
        error: 'Invalid Application ID format',
        code: 'VALIDATION_ERROR',
        details: 'Application ID must be a number'
      },
      { status: 400 }
    );
  }

  let connection;
  try {
    // Check if required environment variables are set
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
      console.error('Missing database configuration');
      return NextResponse.json(
        {
          error: 'Server configuration error',
          code: 'CONFIG_ERROR',
          details: 'Database configuration is incomplete'
        },
        { status: 500 }
      );
    }

    // Create MySQL connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'scholarship_db',
      connectTimeout: 10000, // 10 seconds timeout
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

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('No application found with ID:', id);
      return NextResponse.json(
        { 
          error: 'Application not found',
          code: 'NOT_FOUND',
          details: `No application found with ID ${id}`
        },
        { status: 404 }
      );
    }

    const applicationData = rows[0];
    
    // Validate required fields
    if (!applicationData.id || !applicationData.name) {
      console.error('Invalid application data:', applicationData);
      return NextResponse.json(
        {
          error: 'Invalid application data',
          code: 'DATA_ERROR',
          details: 'Application data is incomplete or corrupted'
        },
        { status: 500 }
      );
    }

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

    // Handle specific MySQL errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { 
            error: 'Database connection failed',
            details: 'Could not connect to the database server',
            code: 'CONNECTION_ERROR'
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes('ER_NO_SUCH_TABLE')) {
        return NextResponse.json(
          { 
            error: 'Database error',
            details: 'Required table does not exist',
            code: 'TABLE_ERROR'
          },
          { status: 500 }
        );
      }

      if (error.message.includes('ER_ACCESS_DENIED_ERROR')) {
        return NextResponse.json(
          {
            error: 'Database authentication failed',
            details: 'Invalid database credentials',
            code: 'AUTH_ERROR'
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch application details',
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
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