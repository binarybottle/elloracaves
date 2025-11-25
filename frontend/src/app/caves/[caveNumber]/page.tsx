import { notFound } from 'next/navigation';
import { CaveDetail } from '@/components/caves/CaveDetail';

// Use internal Docker network URL for server-side fetching
const API_URL = process.env.API_URL || 'http://backend:8000/api/v1';

async function getCave(caveNumber: string) {
  try {
    const res = await fetch(`${API_URL}/caves/${caveNumber}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching cave:', error);
    return null;
  }
}

export default async function CavePage({
  params,
}: {
  params: { caveNumber: string };
}) {
  const cave = await getCave(params.caveNumber);

  if (!cave) {
    notFound();
  }

  return <CaveDetail cave={cave} />;
}

export async function generateMetadata({
  params,
}: {
  params: { caveNumber: string };
}) {
  const cave = await getCave(params.caveNumber);

  if (!cave) {
    return {
      title: 'Cave Not Found',
    };
  }

  return {
    title: `${cave.name} - Ellora Caves`,
    description: cave.description || `Explore ${cave.name} at Ellora`,
  };
}
