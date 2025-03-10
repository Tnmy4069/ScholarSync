import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { aadhar_no, cap_id } = body;

    // Create MySQL connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'scholarship_db',
    });

    // Fetch Aadhaar data
    const [aadharRows] = await connection.execute(
      'SELECT * FROM aadhar_db WHERE aadhar_no = ?',
      [aadhar_no]
    );

    // Fetch CAP data
    const [capRows] = await connection.execute(
      'SELECT * FROM cap_db WHERE cap_id = ?',
      [cap_id]
    );

    await connection.end();

    if (!Array.isArray(aadharRows) || aadharRows.length === 0) {
      return NextResponse.json(
        { error: 'Aadhaar number not found' },
        { status: 404 }
      );
    }

    if (!Array.isArray(capRows) || capRows.length === 0) {
      return NextResponse.json(
        { error: 'CAP ID not found' },
        { status: 404 }
      );
    }

    // Return the verified data
    const verifiedData = {
      aadhar: aadharRows[0],
      cap: capRows[0],
    };

    return NextResponse.json(verifiedData);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 