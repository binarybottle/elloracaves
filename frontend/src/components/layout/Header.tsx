/**
 * Header component with responsive navigation.
 * 
 * Displays site title and navigation links. On mobile devices,
 * navigation collapses into a hamburger menu.
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary-600">
              Ellora Caves
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link href="/caves" className="text-gray-700 hover:text-primary-600 transition-colors">
              Browse Caves
            </Link>
            <Link href="/search" className="text-gray-700 hover:text-primary-600 transition-colors">
              Search
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/caves"
              className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Caves
            </Link>
            <Link
              href="/search"
              className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Search
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
