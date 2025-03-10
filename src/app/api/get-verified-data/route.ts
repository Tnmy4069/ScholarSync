import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const verifiedData = request.cookies.get('verifiedData');

    if (!verifiedData?.value) {
      return NextResponse.json(
        { error: 'No verified data found' },
        { status: 404 }
      );
    }

    // Parse the stored data
    const data = JSON.parse(verifiedData.value);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching verified data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verified data' },
      { status: 500 }
    );
  }
} 