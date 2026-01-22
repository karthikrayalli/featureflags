import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@/types';

// In-memory storage (in production, this would be a database)
const defaultUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
};

let userStorage: User = defaultUser;

export async function GET() {
  return NextResponse.json(userStorage);
}

export async function PUT(request: NextRequest) {
  try {
    const user = await request.json();
    userStorage = user;
    return NextResponse.json({ success: true, user: userStorage });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
