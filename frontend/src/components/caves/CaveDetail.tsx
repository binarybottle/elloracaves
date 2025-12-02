/**
 * Cave detail component showing cave information and floor plans
 */

'use client';

import Link from 'next/link';
import { Building2, Layers } from 'lucide-react';
import { Cave } from '@/lib/api';

interface CaveDetailProps {
  cave: Cave;
}

export function CaveDetail({ cave }: CaveDetailProps) {
  const plans = cave.plans || [];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{cave.name}</span>
        </nav>

        {/* Cave Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {cave.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {cave.tradition}
                </span>
                {cave.date_range && (
                  <span className="text-sm">{cave.date_range}</span>
                )}
              </div>
            </div>
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>

          {cave.description && (
            <p className="mt-4 text-gray-700 leading-relaxed">
              {cave.description}
            </p>
          )}
        </div>

        {/* Floor Plans */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="h-6 w-6" />
            Floor Plans
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/caves/${cave.cave_number}/floor/${plan.floor_number}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center relative">
                  {/* Placeholder for floor plan thumbnail */}
                  <div className="text-center p-6">
                    <Layers className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Floor {plan.floor_number}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Floor {plan.floor_number}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{plan.image_count} images</span>
                    <span className="text-primary-600 group-hover:text-primary-700">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {plans.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Layers className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No floor plans available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
