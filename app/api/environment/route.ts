import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (in production, this would be a database)
let environmentStorage: string = 'production';

export async function GET() {
  return NextResponse.json({ environment: environmentStorage });
}

export async function PUT(request: NextRequest) {
  try {
    const { environment } = await request.json();
    if (typeof environment !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Environment must be a string' },
        { status: 400 }
      );
    }
    environmentStorage = environment;
    return NextResponse.json({ success: true, environment: environmentStorage });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
