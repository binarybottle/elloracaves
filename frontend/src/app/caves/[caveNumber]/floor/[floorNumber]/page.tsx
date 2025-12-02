import { redirect } from 'next/navigation';

interface FloorPageProps {
  params: {
    caveNumber: string;
    floorNumber: string;
  };
}

// This page redirects to the explore view which handles floor navigation better
export default function FloorPage({ params }: FloorPageProps) {
  redirect(`/explore?cave=${params.caveNumber}&floor=${params.floorNumber}`);
}

export async function generateMetadata({ params }: FloorPageProps) {
  return {
    title: `Cave ${params.caveNumber} Floor ${params.floorNumber} - Ellora Caves`,
    description: `Interactive floor plan for Cave ${params.caveNumber} at Ellora Caves`,
  };
}
