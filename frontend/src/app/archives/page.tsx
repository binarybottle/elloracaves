'use client';

import CuratedImageCollectionPage from '@/components/image/CuratedImageCollectionPage';
import { getDropdownLabel } from '@/components/cave/CaveMap';

const MEDIUM_ORDER: Record<string, number> = {
  'photograph': 0,
  'aquatint': 1,
  'etching': 2,
  'painting': 3,
};

function mediumRank(medium: string | null): number {
  if (!medium) return 99;
  const lower = medium.toLowerCase();
  for (const [key, rank] of Object.entries(MEDIUM_ORDER)) {
    if (lower.includes(key)) return rank;
  }
  return 50;
}

export default function ArchivesPage() {
  return (
    <CuratedImageCollectionPage
      title="Archival Images"
      emptyMessage="No archival images match the current search."
      includeImage={(image) => image.archival === true}
      intro={(
        <p>
          Archival sources grouped by medium (photographs, etchings, paintings) then by cave.
          Click any image to expand it, then use arrow keys to navigate.
        </p>
      )}
      sortImages={(a, b) => {
        const mediumA = mediumRank(a.medium);
        const mediumB = mediumRank(b.medium);
        if (mediumA !== mediumB) return mediumA - mediumB;
        if (a.cave_id !== b.cave_id) return a.cave_id - b.cave_id;
        return a.file_path.localeCompare(b.file_path);
      }}
      renderMeta={(image) => (
        <span>{getDropdownLabel(image.cave_id)} (ID:{image.image_id})</span>
      )}
    />
  );
}
