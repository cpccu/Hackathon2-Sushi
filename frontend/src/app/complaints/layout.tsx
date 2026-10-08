import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complaints',
  description: 'Voice campus-related concerns anonymously and receive verified responses from City University administration.',
};

export default function ComplaintsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
