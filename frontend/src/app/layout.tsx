/**
 * Root layout component for the Ellora Caves application.
 * 
 * Defines the HTML structure, metadata, and global layout including
 * navigation header and responsive container.
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ellora Caves Documentation',
  description: 'Complete photographic documentation of Ellora cave temples',
  keywords: ['Ellora', 'caves', 'temples', 'archaeology', 'India', 'Buddhist', 'Hindu', 'Jain'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col bg-black">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
