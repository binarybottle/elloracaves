import { notFound } from 'next/navigation';
import Link from 'next/link';
import FloorPlanView from '@/components/image/FloorPlanView';
import { ArrowLeft } from 'lucide-react';

const API_URL = process.env.API_URL || 'http://backend:8000/api/v1';

async function getCave(caveNumber: string) {
  try {
    const res = await fetch(`${API_URL}/caves/${caveNumber}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching cave:', error);
    return null;
  }
}

async function getFloorImages(caveNumber: string, floorNumber: string) {
  try {
    const res = await fetch(
      `${API_URL}/caves/${caveNumber}/floors/${floorNumber}/images`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching floor images:', error);
    return [];
  }
}

export default async function FloorPage({
  params,
}: {
  params: { caveNumber: string; floorNumber: string };
}) {
  const [cave, images] = await Promise.all([
    getCave(params.caveNumber),
    getFloorImages(params.caveNumber, params.floorNumber),
  ]);

  if (!cave) {
    notFound();
  }

  const plan = cave.plans.find(
    (p: any) => p.floor_number === parseInt(params.floorNumber)
  );

  if (!plan) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link
            href={`/caves/${params.caveNumber}`}
            className="text-primary-600 hover:text-primary-700"
          >
            {cave.name}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Floor {params.floorNumber}</span>
        </nav>

        {/* Back Button */}
        <Link
          href={`/caves/${params.caveNumber}`}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {cave.name}
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {cave.name} - Floor {params.floorNumber}
          </h1>
          <p className="text-gray-600">
            {images.length} images on this floor
          </p>
        </div>

        {/* Floor Plan View */}
        <FloorPlanView
          plan={plan}
          images={images}
          caveNumber={params.caveNumber}
          floorNumber={parseInt(params.floorNumber)}
        />
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { caveNumber: string; floorNumber: string };
}) {
  const cave = await getCave(params.caveNumber);

  if (!cave) {
    return { title: 'Floor Not Found' };
  }

  return {
    title: `${cave.name} Floor ${params.floorNumber} - Ellora Caves`,
    description: `Interactive floor plan for ${cave.name} at Ellora Caves`,
  };
}
