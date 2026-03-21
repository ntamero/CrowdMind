import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ history: [] });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wisery-secret-2026') as any;

    // Get votes as XP history
    const votes = await prisma.vote.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        question: { select: { title: true, id: true } },
        option: { select: { label: true } },
      },
    });

    // Get questions created
    const questions = await prisma.question.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    });

    const history: any[] = [];

    votes.forEach((v: any) => {
      const mins = Math.floor((Date.now() - new Date(v.createdAt).getTime()) / 60000);
      const timeStr = mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
      history.push({
        id: v.id,
        type: 'earn',
        amount: '+1 XP',
        description: `Voted "${v.option?.label}" on: ${v.question?.title || 'Question'}`,
        time: timeStr,
        status: 'confirmed',
      });
    });

    questions.forEach((q: any) => {
      const mins = Math.floor((Date.now() - new Date(q.createdAt).getTime()) / 60000);
      const timeStr = mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
      history.push({
        id: q.id,
        type: 'earn',
        amount: '+3 XP',
        description: `Created: ${q.title}`,
        time: timeStr,
        status: 'confirmed',
      });
    });

    // Sort by most recent
    history.sort((a, b) => {
      const parseTime = (t: string) => {
        if (t === 'just now') return 0;
        const num = parseInt(t);
        if (t.includes('m ago')) return num;
        if (t.includes('h ago')) return num * 60;
        if (t.includes('d ago')) return num * 1440;
        return 9999;
      };
      return parseTime(a.time) - parseTime(b.time);
    });

    return NextResponse.json({ history: history.slice(0, 20) });
  } catch {
    return NextResponse.json({ history: [] });
  }
}
