import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (in production, this would be a database)
let overridesStorage: Record<string, string | boolean> = {};

export async function GET() {
  return NextResponse.json(overridesStorage);
}

export async function PUT(request: NextRequest) {
  try {
    const overrides = await request.json();
    overridesStorage = overrides;
    return NextResponse.json({ success: true, overrides: overridesStorage });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
