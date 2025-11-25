/**
 * Root layout component for the Ellora Caves application.
 * 
 * Defines the HTML structure, metadata, and global layout including
 * navigation header and responsive container.
 */

import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';

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
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-gray-800 text-white py-6 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p>© {new Date().getFullYear()} Ellora Caves Documentation Project</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
