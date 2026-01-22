import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (in production, this would be a database)
let flagsStorage: Record<string, any> = {};

export async function GET() {
  return NextResponse.json(flagsStorage);
}

export async function PUT(request: NextRequest) {
  try {
    const flags = await request.json();
    flagsStorage = flags;
    return NextResponse.json({ success: true, flags: flagsStorage });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
