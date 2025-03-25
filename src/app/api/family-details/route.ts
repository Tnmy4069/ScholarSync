import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export async function POST(request: Request) {
  let connection;
  try {
    const formData = await request.formData();
    
    // Extract form data
    const data = {
      student_salaried: formData.get('student_salaried') === 'true',
      father_alive: formData.get('father_alive') === 'true',
      father_working: formData.get('father_working') === 'true',
      father_occupation: formData.get('father_occupation'),
      mother_alive: formData.get('mother_alive') === 'true',
      mother_working: formData.get('mother_working') === 'true',
      mother_occupation: formData.get('mother_occupation'),
      current_year: formData.get('current_year'),
    };

    // Create MySQL connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'sql12769537',
    });

    // Start transaction
    await connection.beginTransaction();

    // First, get the latest application ID
    const [applications] = await connection.execute(
      'SELECT id FROM scholarship_applications ORDER BY id DESC LIMIT 1'
    );

    if (!Array.isArray(applications) || applications.length === 0) {
      throw new Error('No existing application found');
    }

    const applicationId = (applications[0] as any).id;

    // Handle file upload if present
    let marksheetPath = null;
    const marksheetFile = formData.get('marksheet') as File;
    
    if (marksheetFile && data.current_year !== '1') {
      try {
        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `marksheet-${uniqueSuffix}${path.extname(marksheetFile.name)}`;
        const filePath = path.join(uploadDir, filename);

        // Convert File to Buffer and save
        const bytes = await marksheetFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        marksheetPath = `/uploads/${filename}`;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload marksheet');
      }
    }

    // Update scholarship application with family details
    const [result] = await connection.execute(
      `UPDATE scholarship_applications SET
        student_salaried = ?,
        father_alive = ?,
        father_working = ?,
        father_occupation = ?,
        mother_alive = ?,
        mother_working = ?,
        mother_occupation = ?,
        year_of_study = ?,
        marksheet_upload = ?
      WHERE id = ?`,
      [
        data.student_salaried ? 1 : 0,
        data.father_alive ? 1 : 0,
        data.father_working ? 1 : 0,
        data.father_occupation || null,
        data.mother_alive ? 1 : 0,
        data.mother_working ? 1 : 0,
        data.mother_occupation || null,
        data.current_year,
        marksheetPath,
        applicationId
      ]
    );

    // Check if any row was affected
    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 0) {
      throw new Error(`No application found with ID ${applicationId}`);
    }

    // Commit transaction
    await connection.commit();

    return NextResponse.json({
      message: 'Family details saved successfully',
      applicationId
    });
  } catch (error: unknown) {
    // Rollback transaction if connection exists
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }

    console.error('Error saving family details:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to save family details',
        details: errorMessage 
      },
      { status: 500 }
    );
  } finally {
    // Close connection if it exists
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
} 