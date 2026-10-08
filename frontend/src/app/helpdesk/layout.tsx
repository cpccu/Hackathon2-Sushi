import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Helpdesk',
  description: 'Verified institutional information, rules, admission process, waiver policies, and campus facilities for City University.',
};

export default function HelpdeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
