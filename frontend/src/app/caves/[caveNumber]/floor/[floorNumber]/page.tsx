import { redirect } from 'next/navigation';

// Use edge runtime for Cloudflare Pages
export const runtime = 'edge';

interface FloorPageProps {
  params: Promise<{
    caveNumber: string;
    floorNumber: string;
  }>;
}

// This page redirects to the explore view which handles floor navigation better
export default async function FloorPage({ params }: FloorPageProps) {
  const { caveNumber, floorNumber } = await params;
  redirect(`/explore?cave=${caveNumber}&floor=${floorNumber}`);
}

export async function generateMetadata({ params }: FloorPageProps) {
  const { caveNumber, floorNumber } = await params;
  return {
    title: `Cave ${caveNumber} Floor ${floorNumber} - Ellora Caves`,
    description: `Interactive floor plan for Cave ${caveNumber} at Ellora Caves`,
  };
}
