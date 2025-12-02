import { notFound } from 'next/navigation';
import { CaveDetail } from '@/components/caves/CaveDetail';
import { fetchCaveDetail, getAllCaveIds } from '@/lib/api';

// Generate static params for all caves at build time
// Returns empty array if Supabase isn't configured (pages will be generated on-demand)
export async function generateStaticParams() {
  // Skip static generation if Supabase isn't configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('Skipping static generation: Supabase not configured');
    return [];
  }
  
  try {
    const caveIds = await getAllCaveIds();
    return caveIds.map((caveNumber) => ({
      caveNumber: caveNumber,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Static page generation with revalidation
export const revalidate = 3600; // Revalidate every hour

export default async function CavePage({
  params,
}: {
  params: { caveNumber: string };
}) {
  try {
    const cave = await fetchCaveDetail(params.caveNumber);

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
  params: { caveNumber: string };
}) {
  try {
    const cave = await fetchCaveDetail(params.caveNumber);

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
