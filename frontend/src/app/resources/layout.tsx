import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Search, browse, and share previous exam questions, lecture notes, slides, and lab materials at City University.',
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
