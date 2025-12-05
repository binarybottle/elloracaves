import { notFound } from 'next/navigation';
import { CaveDetail } from '@/components/caves/CaveDetail';
import { fetchCaveDetail, getAllCaveIds } from '@/lib/api';

// Use edge runtime for Cloudflare Pages
export const runtime = 'edge';

export default async function CavePage({
  params,
}: {
  params: Promise<{ caveNumber: string }>;
}) {
  const { caveNumber } = await params;
  try {
    const cave = await fetchCaveDetail(caveNumber);

    if (!cave) {
      notFound();
    }

    return <CaveDetail cave={cave} />;
  } catch (error) {
    console.error('Error fetching cave:', error);
    notFound();
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ caveNumber: string }>;
}) {
  const { caveNumber } = await params;
  try {
    const cave = await fetchCaveDetail(caveNumber);

    if (!cave) {
      return {
        title: 'Cave Not Found',
      };
    }

    return {
      title: `${cave.name} - Ellora Caves`,
      description: cave.description || `Explore ${cave.name} at Ellora`,
    };
  } catch (error) {
    return {
      title: 'Cave Not Found',
    };
  }
}
