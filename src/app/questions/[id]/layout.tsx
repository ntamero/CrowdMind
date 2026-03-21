import type { Metadata } from 'next';
import prisma from '@/lib/prisma';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = 'https://wisery.live';

  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        user: { select: { displayName: true, username: true } },
        options: { orderBy: { voteCount: 'desc' } },
      },
    });

    if (!question) {
      return { title: 'Question Not Found' };
    }

    const totalVotes = question.options.reduce((sum, o) => sum + o.voteCount, 0) || question.totalVotes;
    const topOption = question.options[0];
    const topPct = totalVotes > 0 ? Math.round((topOption.voteCount / totalVotes) * 100) : 0;
    const author = question.user?.displayName || question.user?.username || 'Wisery User';
    const optionsList = question.options.map(o => o.label).join(', ');

    const title = question.title;
    const description = question.description
      ? `${question.description.substring(0, 120)} — ${totalVotes.toLocaleString()} votes so far. Cast your vote on Wisery!`
      : `${totalVotes.toLocaleString()} votes — Leading: "${topOption.label}" at ${topPct}%. Vote now on Wisery!`;

    const keywords = [
      question.category,
      'prediction', 'poll', 'vote', 'community opinion',
      'crowd wisdom', 'wisery', question.title.split(' ').slice(0, 5).join(' '),
      ...question.options.map(o => o.label),
    ].filter(Boolean);

    return {
      title,
      description,
      keywords,
      authors: [{ name: author }],
      alternates: {
        canonical: `${baseUrl}/questions/${id}`,
      },
      openGraph: {
        type: 'article',
        url: `${baseUrl}/questions/${id}`,
        title: `${title} — Vote Now on Wisery`,
        description,
        siteName: 'Wisery',
        images: question.imageUrl ? [
          { url: question.imageUrl, width: 1200, height: 630, alt: title },
        ] : [
          { url: `${baseUrl}/og-image.png`, width: 1200, height: 630, alt: title },
        ],
        publishedTime: question.createdAt.toISOString(),
        authors: [author],
        tags: keywords as string[],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} — Vote Now`,
        description,
        images: question.imageUrl ? [question.imageUrl] : [`${baseUrl}/og-image.png`],
      },
      other: {
        'article:published_time': question.createdAt.toISOString(),
        'article:section': question.category || 'General',
        'article:tag': keywords.join(','),
      },
    };
  } catch {
    return {
      title: 'Question | Wisery',
      description: 'Vote on questions and earn rewards on Wisery — the social prediction platform.',
    };
  }
}

async function QuestionJsonLd({ id }: { id: string }) {
  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        user: { select: { displayName: true, username: true } },
        options: true,
      },
    });
    if (!question) return null;

    const totalVotes = question.options.reduce((sum, o) => sum + o.voteCount, 0) || question.totalVotes;
    const baseUrl = 'https://wisery.live';

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "DiscussionForumPosting",
      headline: question.title,
      description: question.description || question.title,
      url: `${baseUrl}/questions/${id}`,
      datePublished: question.createdAt.toISOString(),
      author: {
        "@type": "Person",
        name: question.user?.displayName || question.user?.username || "Wisery User",
      },
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/VoteAction",
          userInteractionCount: totalVotes,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/CommentAction",
          userInteractionCount: question.totalComments,
        },
      ],
      isPartOf: {
        "@type": "WebSite",
        name: "Wisery",
        url: baseUrl,
      },
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  } catch {
    return null;
  }
}

export default async function QuestionLayout({ params, children }: Props) {
  const { id } = await params;
  return (
    <>
      <QuestionJsonLd id={id} />
      {children}
    </>
  );
}
