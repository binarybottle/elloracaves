'use client';

interface ImageInfoPanelProps {
  image: any;
  cave: any;
  collapsible?: boolean;
}

export default function ImageInfoPanel({ image, cave, collapsible = false }: ImageInfoPanelProps) {
  if (!image) {
    return null;
  }

  const content = (
    <div className="space-y-2">
      {image.subject && (
        <h2 className="text-xl text-[#eae2c4] mb-2">{image.subject}</h2>
      )}

      {image.description && (
        <p className="text-sm text-[#eae2c4] leading-relaxed">{image.description}</p>
      )}

      <div className="text-xs space-y-1 pt-1">
        <div>
          <span className="text-gray-400">Location: </span>
          <span className="text-[#eae2c4]">
            {cave?.name || `Cave ${image.cave_id}`}
            {(image.floor_number ?? 0) > 1 && ` (floor ${image.floor_number})`}
          </span>
        </div>
        {image.photographer && (
          <div className="text-gray-400">{image.photographer}</div>
        )}
        <div className="text-gray-600">ID:{image.id}</div>
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <details className="bg-black rounded-lg p-4" open>
        <summary className="cursor-pointer font-semibold text-[#eae2c4] mb-4">
          Image Details
        </summary>
        {content}
      </details>
    );
  }

  return (
    <div className="bg-black rounded-lg p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
      {content}
    </div>
  );
}

