import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      ...user,
      emailVerified: (user as any).emailVerified || false,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { displayName, username, bio } = body;

    // Validate username uniqueness if changed
    if (username && username !== user.username) {
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: user.id } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(username !== undefined && { username }),
        ...(bio !== undefined && { bio }),
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
