import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Discover and register for upcoming club contests, workshops, and campus activities at City University.',
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
