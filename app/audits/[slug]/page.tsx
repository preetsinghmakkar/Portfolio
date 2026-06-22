import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { auditFindings } from '@/data/auditData';
import { AuditDetailPage } from '@/components/audit/AuditDetailPage';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return auditFindings.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = auditFindings.find((f) => f.slug === slug);
  if (!f) return {};
  const title = `${f.protocol} ${f.severity} Severity Finding | Preet Singh`;
  const description = f.summary.overview;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function AuditPage({ params }: Props) {
  const { slug } = await params;
  const finding = auditFindings.find((f) => f.slug === slug);
  if (!finding) notFound();
  return <AuditDetailPage finding={finding} />;
}
