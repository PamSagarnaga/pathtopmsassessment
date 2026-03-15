import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PathToPM Assessment',
  description: 'Discover your Project Manager readiness in 12 minutes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
