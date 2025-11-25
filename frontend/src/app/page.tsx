/**
 * Home page component displaying cave list and search functionality.
 * 
 * Fetches all caves from the API and displays them in a responsive grid.
 * Provides filtering by tradition (Buddhist, Hindu, Jain) and search.
 */

import Link from 'next/link';
import { fetchCaves } from '@/lib/api';
import CaveGrid from '@/components/cave/CaveGrid';
import SearchBar from '@/components/layout/SearchBar';

export default async function HomePage() {
  const caves = await fetchCaves();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Ellora Caves
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Complete photographic documentation of the rock-cut cave temples at Ellora, Maharashtra, India.
          Explore 34 caves spanning Buddhist, Hindu, and Jain traditions from the 6th-10th centuries CE.
        </p>
        <SearchBar />
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Browse Caves</h2>
        <CaveGrid caves={caves} />
      </section>

      <section className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-semibold mb-4">About This Project</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            The Ellora Caves represent one of the largest rock-cut monastery-temple cave complexes
            in the world, carved out of the basalt cliffs of the Charanandri Hills. This documentation
            project provides comprehensive photographic coverage of all 34 caves, with detailed
            floor plans and annotations.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-500">34</div>
              <div className="text-sm text-gray-600">Cave Temples</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-500">3</div>
              <div className="text-sm text-gray-600">Religious Traditions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-500">5</div>
              <div className="text-sm text-gray-600">Centuries</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
