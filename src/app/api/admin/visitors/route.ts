import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }
    const me = await prisma.user.findUnique({ where: { id: currentUser.id }, select: { role: true } });
    if (me?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const days14ago = new Date(todayStart); days14ago.setDate(days14ago.getDate() - 14);

    const [
      totalPageViews,
      todayViews,
      yesterdayViews,
      weekViews,
      monthViews,
      uniqueVisitorsToday,
      uniqueVisitorsWeek,
      uniqueVisitorsMonth,
      loggedInViewsToday,
      guestViewsToday,
    ] = await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.pageView.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
      prisma.pageView.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.pageView.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.pageView.groupBy({ by: ['fingerprint'], where: { createdAt: { gte: todayStart } } }).then(r => r.length),
      prisma.pageView.groupBy({ by: ['fingerprint'], where: { createdAt: { gte: weekStart } } }).then(r => r.length),
      prisma.pageView.groupBy({ by: ['fingerprint'], where: { createdAt: { gte: monthStart } } }).then(r => r.length),
      prisma.pageView.count({ where: { createdAt: { gte: todayStart }, userId: { not: null } } }),
      prisma.pageView.count({ where: { createdAt: { gte: todayStart }, userId: null } }),
    ]);

    // Top pages (last 7 days)
    const topPages = await prisma.pageView.groupBy({
      by: ['path'],
      where: { createdAt: { gte: weekStart } },
      _count: true,
      orderBy: { _count: { path: 'desc' } },
      take: 20,
    });

    // Device breakdown (last 7 days)
    const deviceBreakdown = await prisma.pageView.groupBy({
      by: ['device'],
      where: { createdAt: { gte: weekStart }, device: { not: null } },
      _count: true,
      orderBy: { _count: { device: 'desc' } },
    });

    // Browser breakdown
    const browserBreakdown = await prisma.pageView.groupBy({
      by: ['browser'],
      where: { createdAt: { gte: weekStart }, browser: { not: null } },
      _count: true,
      orderBy: { _count: { browser: 'desc' } },
    });

    // OS breakdown
    const osBreakdown = await prisma.pageView.groupBy({
      by: ['os'],
      where: { createdAt: { gte: weekStart }, os: { not: null } },
      _count: true,
      orderBy: { _count: { os: 'desc' } },
    });

    // Country breakdown
    const countryBreakdown = await prisma.pageView.groupBy({
      by: ['country'],
      where: { createdAt: { gte: weekStart }, country: { not: null } },
      _count: true,
      orderBy: { _count: { country: 'desc' } },
      take: 20,
    });

    // Daily chart data (14 days)
    const viewsLast14 = await prisma.pageView.findMany({
      where: { createdAt: { gte: days14ago } },
      select: { createdAt: true, fingerprint: true, userId: true },
    });

    const chartData = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const dayViews = viewsLast14.filter((v: any) => v.createdAt >= d && v.createdAt < nextD);
      const uniqueFP = new Set(dayViews.map((v: any) => v.fingerprint));
      const loggedIn = dayViews.filter((v: any) => v.userId).length;
      chartData.push({
        date: label,
        views: dayViews.length,
        unique: uniqueFP.size,
        loggedIn,
        guests: dayViews.length - loggedIn,
      });
    }

    // Recent page views (last 50)
    const recentViews = await prisma.pageView.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        fingerprint: true,
        path: true,
        referrer: true,
        device: true,
        browser: true,
        os: true,
        country: true,
        city: true,
        duration: true,
        createdAt: true,
        user: { select: { displayName: true, username: true, email: true } },
      },
    });

    // Top referrers
    const topReferrers = await prisma.pageView.groupBy({
      by: ['referrer'],
      where: { createdAt: { gte: weekStart }, referrer: { not: null } },
      _count: true,
      orderBy: { _count: { referrer: 'desc' } },
      take: 10,
    });

    // Active sessions (unique sessionIds in last 5 min)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeSessions = await prisma.pageView.groupBy({
      by: ['sessionId'],
      where: { createdAt: { gte: fiveMinAgo }, sessionId: { not: null } },
    });

    // Average duration
    const avgDuration = await prisma.pageView.aggregate({
      where: { duration: { not: null, gt: 0 } },
      _avg: { duration: true },
    });

    return NextResponse.json({
      overview: {
        totalPageViews,
        todayViews,
        yesterdayViews,
        weekViews,
        monthViews,
        uniqueVisitorsToday,
        uniqueVisitorsWeek,
        uniqueVisitorsMonth,
        loggedInViewsToday,
        guestViewsToday,
        activeSessions: activeSessions.length,
        avgDuration: Math.round(avgDuration._avg.duration || 0),
      },
      chartData,
      topPages: topPages.map(p => ({ path: p.path, views: p._count })),
      deviceBreakdown: deviceBreakdown.map(d => ({ device: d.device, count: d._count })),
      browserBreakdown: browserBreakdown.map(b => ({ browser: b.browser, count: b._count })),
      osBreakdown: osBreakdown.map(o => ({ os: o.os, count: o._count })),
      countryBreakdown: countryBreakdown.map(c => ({ country: c.country, count: c._count })),
      topReferrers: topReferrers.map(r => ({ referrer: r.referrer, count: r._count })),
      recentViews,
    });
  } catch (error) {
    console.error('Admin visitors error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
