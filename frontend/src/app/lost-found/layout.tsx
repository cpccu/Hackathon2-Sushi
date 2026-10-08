import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lost & Found',
  description: 'Report and search for misplaced or recovered belongings across the City University campus.',
};

export default function LostFoundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
